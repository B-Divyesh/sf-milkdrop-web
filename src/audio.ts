import { BeatTracker, type AudioFrame } from './audio-analysis';

export type FrameListener = (frame: AudioFrame) => void;

const QUIET_FRAME: AudioFrame = { bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: null, beatCount: 0, phrase: false };

export class RoomAudio {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  private animation = 0;
  private tracker = new BeatTracker();
  private demo = false;
  sensitivity = 0.5;

  async start(listener: FrameListener): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
        channelCount: 1,
      },
      video: false,
    });
    this.context = new AudioContext({ latencyHint: 'interactive' });
    await this.context.resume();
    const source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.62;
    source.connect(this.analyser);
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.demo = false;
    this.loop(listener);
  }

  startDemo(listener: FrameListener): void {
    this.stop();
    this.demo = true;
    const started = performance.now();
    let previousBeat = -1;
    const tick = (now: number) => {
      if (!this.demo) return;
      const elapsed = (now - started) / 1000;
      const beatIndex = Math.floor(elapsed * 2);
      const phase = (elapsed * 2) % 1;
      const isNew = beatIndex !== previousBeat;
      previousBeat = beatIndex;
      listener({
        bass: 0.25 + 0.35 * Math.max(0, Math.sin(elapsed * 3.1)),
        mid: 0.2 + 0.25 * Math.max(0, Math.sin(elapsed * 4.7 + 1)),
        high: 0.12 + 0.3 * Math.max(0, Math.sin(elapsed * 7.3 + 2)),
        level: 0.3,
        beat: Math.exp(-phase * 8),
        bpm: 120,
        beatCount: beatIndex + 1,
        phrase: isNew && beatIndex > 0 && beatIndex % 16 === 0,
      });
      this.animation = requestAnimationFrame(tick);
    };
    this.animation = requestAnimationFrame(tick);
  }

  stop(): void {
    cancelAnimationFrame(this.animation);
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.context?.close();
    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.data = null;
    this.demo = false;
    this.tracker.reset();
  }

  private loop(listener: FrameListener): void {
    if (!this.analyser || !this.data) return;
    this.analyser.getByteFrequencyData(this.data);
    const bins = new Float32Array(96);
    const step = Math.max(1, Math.floor(this.data.length / bins.length));
    for (let i = 0; i < bins.length; i += 1) {
      let sum = 0;
      for (let j = 0; j < step; j += 1) sum += this.data[i * step + j] ?? 0;
      bins[i] = sum / step / 255;
    }
    listener(this.tracker.update(bins, performance.now(), this.sensitivity));
    this.animation = requestAnimationFrame(() => this.loop(listener));
  }
}

export { QUIET_FRAME };
