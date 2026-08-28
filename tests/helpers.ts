import type { Page } from '@playwright/test';

export async function installMicrophoneStub(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const scope = window as typeof window & {
      __micConstraints?: MediaStreamConstraints;
      __microphoneStopped?: boolean;
      __mediaRecorderCalls?: number;
      __speechRecognitionCalls?: number;
    };
    const track = { stop: () => { scope.__microphoneStopped = true; } };
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async (constraints: MediaStreamConstraints) => {
          scope.__micConstraints = constraints;
          return { getTracks: () => [track] } as unknown as MediaStream;
        },
      },
    });
    class FakeAnalyser {
      fftSize = 1024;
      smoothingTimeConstant = 0;
      frequencyBinCount = 512;
      getByteFrequencyData(data: Uint8Array): void { data.fill(42); }
    }
    class FakeAudioContext {
      resume = async (): Promise<void> => undefined;
      close = async (): Promise<void> => undefined;
      createMediaStreamSource(): { connect: () => void } { return { connect: () => undefined }; }
      createAnalyser(): FakeAnalyser { return new FakeAnalyser(); }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: class { constructor() { scope.__mediaRecorderCalls = (scope.__mediaRecorderCalls || 0) + 1; } } });
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: class { constructor() { scope.__speechRecognitionCalls = (scope.__speechRecognitionCalls || 0) + 1; } } });
  });
}
