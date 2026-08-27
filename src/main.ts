import './style.css';
import { RoomAudio } from './audio';
import type { AudioFrame } from './audio-analysis';
import { LicenseManager } from './license';
import { renderLegal } from './legal';
import { PRESETS } from './presets';
import { PhoneRemote, ScreenRemote, type RemoteCommand } from './remote';
import { Visualizer } from './visualizer';

const $ = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
};

const updateNetworkState = (): void => {
  $('#offline-banner').toggleAttribute('hidden', navigator.onLine);
};
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

const remoteCode = new URL(location.href).searchParams.get('remote');
if (renderLegal(location.pathname)) {
  // Legal pages are rendered from the same offline-capable application shell.
} else if (remoteCode) {
  renderPhoneRemote(remoteCode);
} else {
  setupVisualizer();
}

function renderPhoneRemote(code: string): void {
  document.title = `Room ${code} remote — Milkdrop Web`;
  $('#site-footer').setAttribute('hidden', '');
  $('#remote-header').setAttribute('hidden', '');
  $('#venue-header').setAttribute('hidden', '');
  $('#main').innerHTML = `
    <section class="remote-page" aria-labelledby="page-title">
      <p class="effective">Pocket field control</p>
      <h1 id="page-title">Guide the growth.</h1>
      <p class="room-label">Room <strong>${escapeHtml(code.toUpperCase())}</strong></p>
      <div class="connection-orbit" id="connection-orbit" aria-hidden="true"></div>
      <p id="phone-status" role="status" aria-live="polite">Connecting to the display…</p>
      <div class="remote-controls" aria-label="Visualizer controls">
        <button type="button" data-command="previous">← Previous specimen</button>
        <button type="button" data-command="next">Next specimen →</button>
        <button type="button" data-command="toggle-auto">Toggle auto-rotate</button>
        <button type="button" data-command="fullscreen">Enter fullscreen</button>
        <label class="select-label remote-palette" for="phone-palette">Pigment set<select id="phone-palette"><option value="lichen">Lichen & pollen</option><option value="coral">Coral & moss</option><option value="moon">Moonlit cyanotype</option><option value="plum">Plum & foxglove</option></select></label>
        <label class="range-label remote-palette" for="phone-intensity"><span>Motion intensity</span><output id="phone-intensity-output">75%</output></label>
        <input class="remote-palette" id="phone-intensity" type="range" min="20" max="100" value="75" />
      </div>
      <p class="small-copy">Only control messages leave this phone. The display’s audio stays on the display.</p>
    </section>`;

  const remote = new PhoneRemote();
  const status = $('#phone-status');
  const orbit = $('#connection-orbit');
  remote.addEventListener('connected', () => { status.textContent = 'Connected. You have the field controls.'; orbit.setAttribute('hidden', ''); });
  remote.addEventListener('disconnected', () => { status.textContent = 'The display disconnected. Reopen its remote panel and scan again.'; orbit.setAttribute('hidden', ''); });
  remote.addEventListener('failure', () => { status.textContent = navigator.onLine ? 'Could not reach this room. Check the code and keep the display’s pairing panel open.' : 'You are offline. Reconnect, then reload this remote.'; orbit.setAttribute('hidden', ''); });
  void remote.connect(code);

  document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button) => button.addEventListener('click', () => {
    remote.send({ type: button.dataset.command } as RemoteCommand);
    status.textContent = 'Control sent.';
  }));
  $('#phone-palette').addEventListener('change', (event) => remote.send({ type: 'palette', value: (event.target as HTMLSelectElement).value }));
  $('#phone-intensity').addEventListener('input', (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    $('#phone-intensity-output').textContent = `${value}%`;
    remote.send({ type: 'intensity', value });
  });
}

function setupVisualizer(): void {
  const audio = new RoomAudio();
  const license = new LicenseManager();
  const stage = $('#stage');
  const landing = $('#landing');
  const header = $('#site-header');
  const footer = $('#site-footer');
  const canvas = $<HTMLCanvasElement>('#visual-canvas');
  const controlsDialog = $<HTMLDialogElement>('#controls-dialog');
  const remoteDialog = $<HTMLDialogElement>('#remote-dialog');
  const venueDialog = $<HTMLDialogElement>('#venue-dialog');
  const presetStrip = $('#preset-strip');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visualizer: Visualizer | null = null;
  let currentPreset = Number(localStorage.getItem('milkdrop:preset') || 0);
  let remote: ScreenRemote | null = null;
  let remoteUrl = '';
  let statusTimeout = 0;
  let lastReadout = 0;

  const intensity = $<HTMLInputElement>('#intensity');
  const sensitivity = $<HTMLInputElement>('#sensitivity');
  const palette = $<HTMLSelectElement>('#palette-select');
  const autoRotate = $<HTMLInputElement>('#auto-rotate');
  const fourK = $<HTMLInputElement>('#four-k');
  const saved = readPreferences();
  intensity.value = String(saved.intensity ?? (reduceMotion ? 35 : 75));
  sensitivity.value = String(saved.sensitivity ?? 50);
  palette.value = saved.palette ?? 'lichen';
  autoRotate.checked = saved.autoRotate ?? !reduceMotion;
  fourK.checked = saved.fourK ?? false;
  updateOutputs();

  PRESETS.forEach((preset, index) => {
    const button = document.createElement('button');
    button.className = `preset-chip${preset.premium ? ' locked' : ''}`;
    button.type = 'button';
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')}: ${preset.name}${preset.premium ? ', Venue Pack' : ''}`);
    button.textContent = String(index + 1).padStart(2, '0');
    button.addEventListener('click', () => selectPreset(index));
    presetStrip.append(button);
  });
  if (PRESETS[currentPreset]?.premium && !license.unlocked) currentPreset = 0;
  renderPreset();

  const start = async (demo = false): Promise<void> => {
    const button = $<HTMLButtonElement>('#start-button');
    button.setAttribute('aria-busy', 'true');
    button.textContent = demo ? 'Opening preview…' : 'Opening the microphone…';
    $('#permission-help').setAttribute('hidden', '');
    try {
      if (!visualizer) visualizer = new Visualizer(canvas);
      applyTuning();
      if (demo) audio.startDemo(onFrame);
      else await audio.start(onFrame);
      $('#input-label').textContent = demo ? 'Preview signal' : 'Room mic live';
      landing.setAttribute('hidden', '');
      header.setAttribute('hidden', '');
      footer.setAttribute('hidden', '');
      stage.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      showStatus(demo ? 'Preview signal started — no microphone is in use' : 'Microphone open — audio stays here');
    } catch (error) {
      audio.stop();
      visualizer?.destroy();
      visualizer = null;
      const message = error instanceof Error ? error.message : '';
      $('#permission-title').textContent = message.includes('WebGL') ? 'This browser could not start the visual canvas.' : 'The microphone stayed closed.';
      $('#permission-detail').textContent = message === 'unsupported' ? 'This browser does not offer microphone access. Try a current version of Chrome, Edge, Firefox, or Safari.' : message.includes('WebGL') ? 'Turn on hardware acceleration or try another current browser. You can still read the field notes below.' : 'Allow microphone access in this site’s browser settings, then try again. You can also open the no-mic preview.';
      $('#permission-help').removeAttribute('hidden');
    } finally {
      button.removeAttribute('aria-busy');
      button.innerHTML = '<span aria-hidden="true">●</span> Listen to the room';
    }
  };

  function onFrame(frame: AudioFrame): void {
    visualizer?.setAudio(frame);
    if (frame.phrase && autoRotate.checked) selectPreset(nextAvailable(currentPreset, 1));
    const now = performance.now();
    if (now - lastReadout > 180) {
      $('#beat-state').textContent = frame.bpm ? (frame.beat > .5 ? 'Beat found · downbeat' : 'Beat found') : 'Listening for a pulse';
      $('#tempo-value').textContent = frame.bpm ? `${frame.bpm} BPM` : '— BPM';
      lastReadout = now;
    }
  }

  function selectPreset(index: number): void {
    const normalized = (index + PRESETS.length) % PRESETS.length;
    if (PRESETS[normalized].premium && !license.unlocked) {
      openDialog(venueDialog);
      $('#license-message').textContent = `${PRESETS[normalized].name} is part of the Venue Pack.`;
      return;
    }
    currentPreset = normalized;
    localStorage.setItem('milkdrop:preset', String(currentPreset));
    visualizer?.setPreset(currentPreset);
    renderPreset();
    showStatus(`${String(currentPreset + 1).padStart(2, '0')} · ${PRESETS[currentPreset].name}`);
  }

  function renderPreset(): void {
    $('#preset-number').textContent = String(currentPreset + 1).padStart(2, '0');
    $('#preset-name').textContent = PRESETS[currentPreset].name;
    document.querySelectorAll<HTMLButtonElement>('.preset-chip').forEach((button, index) => {
      button.setAttribute('aria-current', String(index === currentPreset));
      button.classList.toggle('locked', PRESETS[index].premium && !license.unlocked);
    });
    visualizer?.setPreset(currentPreset);
    document.querySelectorAll<HTMLButtonElement>('.preset-chip')[currentPreset]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }

  function nextAvailable(from: number, direction: number): number {
    let next = from;
    do next = (next + direction + PRESETS.length) % PRESETS.length;
    while (PRESETS[next].premium && !license.unlocked);
    return next;
  }

  function applyTuning(): void {
    const value = Number(intensity.value) / 100;
    audio.sensitivity = Number(sensitivity.value) / 100;
    visualizer?.setIntensity(value);
    visualizer?.setPalette(palette.value);
    visualizer?.setHighResolution(fourK.checked && license.unlocked);
    localStorage.setItem('milkdrop:preferences', JSON.stringify({ intensity: Number(intensity.value), sensitivity: Number(sensitivity.value), palette: palette.value, autoRotate: autoRotate.checked, fourK: fourK.checked }));
  }

  function updateOutputs(): void {
    $('#intensity-output').textContent = `${intensity.value}%`;
    $('#sensitivity-output').textContent = `${sensitivity.value}%`;
  }

  function showStatus(message: string): void {
    const element = $('#stage-status');
    element.textContent = message;
    element.classList.add('visible');
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(() => element.classList.remove('visible'), 1800);
  }

  function stop(): void {
    audio.stop();
    visualizer?.destroy();
    visualizer = null;
    remote?.stop();
    remote = null;
    stage.setAttribute('hidden', '');
    landing.removeAttribute('hidden');
    header.removeAttribute('hidden');
    footer.removeAttribute('hidden');
    document.body.style.overflow = '';
    controlsDialog.close();
    $<HTMLButtonElement>('#start-button').focus();
  }

  const toggleChrome = (): void => {
    const hidden = stage.classList.toggle('chrome-hidden');
    $('#show-controls').toggleAttribute('hidden', !hidden);
    if (!hidden) $<HTMLButtonElement>('#hide-button').focus();
  };

  const fullscreen = async (): Promise<void> => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch { showStatus('Fullscreen was blocked by the browser'); }
  };

  const openRemote = async (): Promise<void> => {
    openDialog(remoteDialog);
    if (remote) return;
    remote = new ScreenRemote();
    const status = $('#remote-status');
    $('#room-code').textContent = remote.code;
    remoteUrl = `${location.origin}/?remote=${remote.code}`;
    try {
      const QRCode = await import('qrcode');
      const qr = document.createElement('canvas');
      await QRCode.toCanvas(qr, remoteUrl, { width: 160, margin: 0, color: { dark: '#15231cff', light: '#ffffffff' } });
      $('#qr-frame').replaceChildren(qr);
      await remote.start();
      remote.addEventListener('ready', () => status.textContent = 'Room ready. Scan with your phone camera.');
      remote.addEventListener('connected', () => { status.textContent = 'Phone connected. The field controls are live.'; showStatus('Phone remote connected'); });
      remote.addEventListener('disconnected', () => { status.textContent = 'Phone disconnected. Scan again to reconnect.'; });
      remote.addEventListener('failure', () => { status.textContent = navigator.onLine ? 'Pairing is blocked on this network. The visualizer still works without it.' : 'Remote pairing needs a network connection.'; });
      remote.addEventListener('command', (event) => handleRemote((event as CustomEvent<RemoteCommand>).detail));
    } catch {
      status.textContent = navigator.onLine ? 'Could not prepare phone pairing. Close this panel and try again.' : 'Remote pairing needs a network connection.';
    }
  };

  function handleRemote(command: RemoteCommand): void {
    if (command.type === 'next') selectPreset(nextAvailable(currentPreset, 1));
    else if (command.type === 'previous') selectPreset(nextAvailable(currentPreset, -1));
    else if (command.type === 'toggle-auto') { autoRotate.checked = !autoRotate.checked; applyTuning(); showStatus(`Auto-rotate ${autoRotate.checked ? 'on' : 'off'}`); }
    else if (command.type === 'fullscreen') void fullscreen();
    else if (command.type === 'palette') { palette.value = command.value; applyTuning(); showStatus('Pigment set changed'); }
    else if (command.type === 'intensity') { intensity.value = String(command.value); updateOutputs(); applyTuning(); }
  }

  const updateLicenseUi = (): void => {
    $('#venue-tools').toggleAttribute('hidden', !license.unlocked);
    renderPreset();
    if (license.unlocked) $('#license-message').textContent = 'Venue Pack active on this device.';
  };
  license.addEventListener('change', updateLicenseUi);
  void license.initialize().then(updateLicenseUi);
  updateLicenseUi();

  $('#start-button').addEventListener('click', () => void start());
  $('#retry-button').addEventListener('click', () => void start());
  $('#demo-button').addEventListener('click', () => void start(true));
  $('#previous-preset').addEventListener('click', () => selectPreset(nextAvailable(currentPreset, -1)));
  $('#next-preset').addEventListener('click', () => selectPreset(nextAvailable(currentPreset, 1)));
  $('#controls-button').addEventListener('click', () => openDialog(controlsDialog));
  $('#remote-button').addEventListener('click', () => void openRemote());
  $('#remote-header').addEventListener('click', () => void openRemote());
  $('#venue-header').addEventListener('click', () => openDialog(venueDialog));
  $('#fullscreen-button').addEventListener('click', () => void fullscreen());
  $('#hide-button').addEventListener('click', toggleChrome);
  $('#show-controls').addEventListener('click', toggleChrome);
  $('#stop-button').addEventListener('click', stop);
  intensity.addEventListener('input', () => { updateOutputs(); applyTuning(); });
  sensitivity.addEventListener('input', () => { updateOutputs(); applyTuning(); });
  palette.addEventListener('change', applyTuning);
  autoRotate.addEventListener('change', applyTuning);
  fourK.addEventListener('change', applyTuning);
  $('#logo-file').addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !license.unlocked) return;
    const image = $<HTMLImageElement>('#venue-logo');
    image.src = URL.createObjectURL(file);
    image.removeAttribute('hidden');
  });
  $('#copy-remote').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(remoteUrl); $('#remote-status').textContent = 'Remote link copied.'; }
    catch { $('#remote-status').textContent = `Open this on the phone: ${remoteUrl}`; }
  });
  $('#restore-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = $('#license-message');
    message.textContent = 'Checking this license…';
    try {
      const valid = await license.restore($<HTMLInputElement>('#license-input').value);
      message.textContent = valid ? 'Venue Pack restored. The rare specimens are ready.' : 'That license is not active for Milkdrop Web. Check the token and try again.';
    } catch { message.textContent = 'The license service is unreachable. Your free specimens still work; reconnect and try again.'; }
  });
  document.querySelectorAll<HTMLButtonElement>('.dialog-close').forEach((button) => button.addEventListener('click', () => (button.closest('dialog') as HTMLDialogElement)?.close()));
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  controlsDialog.addEventListener('close', applyTuning);

  window.addEventListener('keydown', (event) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as Element).tagName) || document.querySelector('dialog[open]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); selectPreset(nextAvailable(currentPreset, 1)); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); selectPreset(nextAvailable(currentPreset, -1)); }
    else if (event.key.toLowerCase() === 'f') void fullscreen();
    else if (event.key.toLowerCase() === 'h' && !stage.hasAttribute('hidden')) toggleChrome();
    else if (event.key.toLowerCase() === 'c' && !stage.hasAttribute('hidden')) openDialog(controlsDialog);
    else if (event.key.toLowerCase() === 'r' && !stage.hasAttribute('hidden')) void openRemote();
    else if (event.code === 'Space' && !stage.hasAttribute('hidden')) { event.preventDefault(); stop(); }
  });
}

function openDialog(dialog: HTMLDialogElement): void {
  if (!dialog.open) dialog.showModal();
}

function readPreferences(): Partial<{ intensity: number; sensitivity: number; palette: string; autoRotate: boolean; fourK: boolean }> {
  try { return JSON.parse(localStorage.getItem('milkdrop:preferences') || '{}') as Partial<{ intensity: number; sensitivity: number; palette: string; autoRotate: boolean; fourK: boolean }>; }
  catch { return {}; }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}
