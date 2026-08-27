export interface AudioFrame {
  bass: number;
  mid: number;
  high: number;
  level: number;
  beat: number;
  bpm: number | null;
  beatCount: number;
  phrase: boolean;
}

export class BeatTracker {
  private previous: Float32Array | null = null;
  private fluxHistory: number[] = [];
  private beatTimes: number[] = [];
  private lastBeat = -Infinity;
  private count = 0;
  private smoothedBeat = 0;

  update(spectrum: Float32Array, nowMs: number, sensitivity = 0.5): AudioFrame {
    let flux = 0;
    let total = 0;
    let bass = 0;
    let mid = 0;
    let high = 0;
    for (let i = 0; i < spectrum.length; i += 1) {
      const value = Math.max(0, Math.min(1, spectrum[i]));
      total += value;
      if (i < spectrum.length * 0.12) bass += value;
      else if (i < spectrum.length * 0.48) mid += value;
      else high += value;
      if (this.previous) flux += Math.max(0, value - this.previous[i]);
    }

    this.previous = spectrum.slice();
    this.fluxHistory.push(flux);
    if (this.fluxHistory.length > 48) this.fluxHistory.shift();
    const mean = this.fluxHistory.reduce((sum, value) => sum + value, 0) / this.fluxHistory.length;
    const variance = this.fluxHistory.reduce((sum, value) => sum + (value - mean) ** 2, 0) / this.fluxHistory.length;
    const threshold = mean + Math.sqrt(variance) * (0.9 - sensitivity * 0.6);
    const isBeat = this.fluxHistory.length > 12 && flux > threshold && flux > 0.12 && nowMs - this.lastBeat > 210;
    let phrase = false;
    if (isBeat) {
      this.lastBeat = nowMs;
      this.count += 1;
      phrase = this.count > 1 && (this.count - 1) % 16 === 0;
      this.beatTimes.push(nowMs);
      if (this.beatTimes.length > 16) this.beatTimes.shift();
      this.smoothedBeat = this.count % 4 === 1 ? 1 : 0.72;
    } else {
      this.smoothedBeat *= 0.88;
    }

    return {
      bass: bass / Math.max(1, Math.floor(spectrum.length * 0.12)),
      mid: mid / Math.max(1, Math.floor(spectrum.length * 0.36)),
      high: high / Math.max(1, Math.ceil(spectrum.length * 0.52)),
      level: total / spectrum.length,
      beat: this.smoothedBeat,
      bpm: this.tempo(),
      beatCount: this.count,
      phrase,
    };
  }

  reset(): void {
    this.previous = null;
    this.fluxHistory = [];
    this.beatTimes = [];
    this.lastBeat = -Infinity;
    this.count = 0;
    this.smoothedBeat = 0;
  }

  private tempo(): number | null {
    if (this.beatTimes.length < 4) return null;
    const intervals = this.beatTimes.slice(1).map((time, index) => time - this.beatTimes[index]).sort((a, b) => a - b);
    let interval = intervals[Math.floor(intervals.length / 2)];
    let bpm = 60000 / interval;
    while (bpm < 70) bpm *= 2;
    while (bpm > 180) bpm /= 2;
    return Math.round(bpm);
  }
}
