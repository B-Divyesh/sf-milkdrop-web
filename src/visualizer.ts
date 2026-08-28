import type { AudioFrame } from './audio-analysis';
import { PALETTES } from './presets';

const VERTEX = `
attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mode;
uniform float u_intensity;
uniform float u_beat;
uniform vec4 u_audio;
uniform vec3 u_bg;
uniform vec3 u_a;
uniform vec3 u_b;

#define PI 3.14159265359

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y); }
float line(float d,float w){ return smoothstep(w,0.0,abs(d)); }
mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/min(u_resolution.x,u_resolution.y);
  float t=u_time*(.12+.28*u_intensity);
  float bass=u_audio.x, mid=u_audio.y, high=u_audio.z, level=u_audio.w;
  float r=length(uv), a=atan(uv.y,uv.x);
  float f=0.; float g=0.;
  vec3 col=u_bg;

  if(u_mode<.5){
    float stem=line(uv.x+.08*sin(uv.y*3.+t),.012+.02*bass);
    float fronds=0.;
    for(float i=0.;i<9.;i++){ float y=-.55+i*.13; float side=mod(i,2.)*2.-1.; vec2 q=uv-vec2(side*.14,y); q*=rot(side*(-.55+.1*sin(t+i))); fronds+=line(length(q*vec2(.7,2.3))-.12-.025*bass,.018); }
    f=stem+fronds; g=line(r-.26-.08*sin(a*7.+t*2.)*mid,.02);
  } else if(u_mode<1.5){
    f=line(r-(.24+.05*sin(a*6.-t*3.)+.08*bass),.018);
    g=pow(max(0.,sin(a*18.+r*24.-t*5.)),18.)*smoothstep(.75,.15,r)*(high+.2);
  } else if(u_mode<2.5){
    vec2 q=uv; q.x+=.12*sin(q.y*4.+t*2.); float n=noise(q*4.+t);
    f=smoothstep(.62,.48,r+.18*n-.18*bass); g=line(n-.52,.035)*smoothstep(.8,.1,r);
  } else if(u_mode<3.5){
    float petals=abs(cos(a*5.))*(.27+.12*mid); f=line(r-petals,.025+.018*u_beat); g=line(r-.08-.05*bass,.025);
  } else if(u_mode<4.5){
    vec2 q=uv; q.y+=.45; float branches=0.;
    for(float i=0.;i<6.;i++){ vec2 z=q*rot((i-2.5)*.22); branches+=line(z.x-.09*sin(z.y*8.+i+t),.009+.015*bass)*smoothstep(.75,.05,abs(z.y)); }
    f=branches; g=noise(uv*8.+t)*.35;
  } else if(u_mode<5.5){
    vec2 cell=fract((uv+1.)*(5.+high*4.))-.5; float h=hash(floor((uv+1.)*(5.+high*4.))); f=line(length(cell)-(.08+.17*h+.05*u_beat),.025); g=pow(noise(uv*12.-t),4.)*mid;
  } else if(u_mode<6.5){
    vec2 q=abs(uv); f=line(q.x-(.1+.2*sin(q.y*7.-t*3.)*mid),.015); g=line(q.y-(.25+.06*sin(q.x*18.+t*2.)),.018);
  } else if(u_mode<7.5){
    f=line(fract(r*7.-t*.7)-.5,.05+.06*bass)*smoothstep(.9,.08,r); g=line(sin(a*9.+t)+.35*sin(r*22.),.08)*mid;
  } else if(u_mode<8.5){
    vec2 q=uv*rot(.2*sin(t)); f=line(q.x-.18*sin(q.y*9.+t*3.),.018+.035*high); g=line(q.x+.18*sin(q.y*9.+t*3.),.018);
  } else if(u_mode<9.5){
    float n=noise(uv*3.+vec2(t,-t)); f=line(sin((uv.y+n*.35)*13.-t*4.),.12+.1*bass); g=smoothstep(.7,.1,r)*noise(uv*10.);
  } else if(u_mode<10.5){
    float petals=abs(sin(a*3.+t*.3))*(.34+.1*bass); f=line(r-petals,.016); g=line(r-(petals*.55+.07*sin(a*6.-t)),.018);
  } else {
    vec2 q=uv; float net=0.;
    for(float i=0.;i<5.;i++){ q=abs(q)/max(dot(q,q),.18)-.75; q*=rot(.12+t*.01); net+=exp(-12.*abs(length(q)-.45)); }
    f=net*.16*(.6+bass); g=pow(noise(uv*14.+t),5.)*high;
  }

  float pulse=u_beat*(.18+.22*u_intensity);
  col=mix(col,u_a,clamp(f*(.65+level)+g*.25,0.,1.));
  col=mix(col,u_b,clamp(g*.65+f*pulse,0.,1.));
  col+=u_b*pow(max(0.,1.-r*1.8),4.)*pulse*.35;
  col*=.96+.04*noise(gl_FragCoord.xy*.45+u_time);
  gl_FragColor=vec4(col,1.);
}`;

export class Visualizer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private frame: AudioFrame = { bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: null, beatCount: 0, phrase: false };
  private animation = 0;
  private started = performance.now();
  private palette = PALETTES.lichen;
  private mode = 0;
  private intensity = 0.75;
  private highResolution = false;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL is unavailable on this device.');
    this.gl = gl;
    this.program = this.createProgram(VERTEX, FRAGMENT);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.loop();
  }

  setAudio(frame: AudioFrame): void { this.frame = frame; }
  setPreset(index: number): void { this.mode = index; }
  setIntensity(value: number): void { this.intensity = value; }
  setPalette(name: string): void { this.palette = PALETTES[name] ?? PALETTES.lichen; }
  setHighResolution(enabled: boolean): void {
    this.highResolution = enabled;
    this.canvas.dataset.resolutionCap = enabled ? '3840x2160' : '1920x2160';
    this.resize();
  }
  destroy(): void { cancelAnimationFrame(this.animation); }

  private loop = (): void => {
    this.resize();
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    const uniform = (name: string) => gl.getUniformLocation(this.program, name);
    gl.uniform2f(uniform('u_resolution'), this.canvas.width, this.canvas.height);
    gl.uniform1f(uniform('u_time'), (performance.now() - this.started) / 1000);
    gl.uniform1f(uniform('u_mode'), this.mode);
    gl.uniform1f(uniform('u_intensity'), this.intensity);
    gl.uniform1f(uniform('u_beat'), this.frame.beat);
    gl.uniform4f(uniform('u_audio'), this.frame.bass, this.frame.mid, this.frame.high, this.frame.level);
    gl.uniform3fv(uniform('u_bg'), this.palette[0]);
    gl.uniform3fv(uniform('u_a'), this.palette[1]);
    gl.uniform3fv(uniform('u_b'), this.palette[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.animation = requestAnimationFrame(this.loop);
  };

  private resize(): void {
    const cap = this.highResolution ? 3840 : 1920;
    const ratio = Math.min(devicePixelRatio, this.highResolution ? 2 : 1.35);
    const width = Math.min(cap, Math.round(this.canvas.clientWidth * ratio));
    const height = Math.min(2160, Math.round(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Could not create a WebGL shader.');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed.');
      return shader;
    };
    const program = gl.createProgram();
    if (!program) throw new Error('Could not create the WebGL program.');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Shader linking failed.');
    return program;
  }
}
