import { describe, expect, it } from 'vitest';
import { BeatTracker } from './audio-analysis';

describe('BeatTracker', () => {
  it('returns normalized frequency bands for quiet input', () => {
    const frame = new BeatTracker().update(new Float32Array(96), 0);
    expect(frame.level).toBe(0);
    expect(frame.bpm).toBeNull();
  });

  it('estimates a 120 BPM pulse after repeated onsets', () => {
    const tracker = new BeatTracker();
    let frame = tracker.update(new Float32Array(96), 0);
    for (let beat = 1; beat <= 12; beat += 1) {
      tracker.update(new Float32Array(96), beat * 500 - 40);
      frame = tracker.update(new Float32Array(96).fill(0.9), beat * 500);
    }
    expect(frame.bpm).toBe(120);
    expect(frame.beatCount).toBeGreaterThan(4);
  });

  it('does not double trigger inside the refractory window', () => {
    const tracker = new BeatTracker();
    for (let i = 0; i < 13; i += 1) tracker.update(new Float32Array(96), i * 30);
    const first = tracker.update(new Float32Array(96).fill(1), 500);
    tracker.update(new Float32Array(96), 510);
    const second = tracker.update(new Float32Array(96).fill(1), 550);
    expect(second.beatCount).toBe(first.beatCount);
  });
});
