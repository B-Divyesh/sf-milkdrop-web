import type { DataConnection, Peer } from 'peerjs';

export type RemoteCommand =
  | { type: 'next' | 'previous' | 'toggle-auto' | 'fullscreen' }
  | { type: 'palette'; value: string }
  | { type: 'intensity'; value: number };

const createCode = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

export class ScreenRemote extends EventTarget {
  peer: Peer | null = null;
  connection: DataConnection | null = null;
  readonly code = createCode();

  async start(): Promise<void> {
    if (this.peer) return;
    const { Peer } = await import('peerjs');
    this.peer = new Peer(`milkdrop-${this.code.toLowerCase()}`);
    this.peer.on('open', () => this.dispatchEvent(new Event('ready')));
    this.peer.on('connection', (connection) => {
      this.connection?.close();
      this.connection = connection;
      connection.on('open', () => this.dispatchEvent(new Event('connected')));
      connection.on('data', (data) => this.dispatchEvent(new CustomEvent('command', { detail: data as RemoteCommand })));
      connection.on('close', () => this.dispatchEvent(new Event('disconnected')));
    });
    this.peer.on('error', (error) => this.dispatchEvent(new CustomEvent('failure', { detail: error })));
  }

  stop(): void { this.connection?.close(); this.peer?.destroy(); this.connection = null; this.peer = null; }
}

export class PhoneRemote extends EventTarget {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;

  async connect(code: string): Promise<void> {
    const { Peer } = await import('peerjs');
    this.peer = new Peer();
    this.peer.on('open', () => {
      this.connection = this.peer!.connect(`milkdrop-${code.toLowerCase()}`, { reliable: true });
      this.connection.on('open', () => this.dispatchEvent(new Event('connected')));
      this.connection.on('close', () => this.dispatchEvent(new Event('disconnected')));
      this.connection.on('error', (error) => this.dispatchEvent(new CustomEvent('failure', { detail: error })));
    });
    this.peer.on('error', (error) => this.dispatchEvent(new CustomEvent('failure', { detail: error })));
  }

  send(command: RemoteCommand): void {
    if (this.connection?.open) this.connection.send(command);
  }
}
