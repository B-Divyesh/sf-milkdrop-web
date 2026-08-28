import './style.css';
import { RoomAudio } from './audio';
import type { AudioFrame } from './audio-analysis';
import { getStaticPage, notFoundPage, type StaticPage } from './legal';
import { LicenseManager } from './license';
import { PRESETS } from './presets';
import { PhoneRemote, ScreenRemote, type RemoteCommand } from './remote';
import { Visualizer } from './visualizer';

const ORIGIN = 'https://milkdrop-web.sociobot.in';
const HOME_TITLE = 'Milkdrop Web — room music visualizer';
const HOME_DESCRIPTION = 'Turn room music into full-screen botanical visuals for TVs and projectors. Try the sample without microphone access.';

const $ = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
};

const main = $<HTMLElement>('#main');
const homeMarkup = main.innerHTML;
const initialStage = main.querySelector<HTMLElement>('#stage');
if (!initialStage) throw new Error('Missing demo stage');
const stageMarkup = initialStage.outerHTML;
let teardownRoute: (() => void) | null = null;

const updateNetworkState = (): void => {
  $('#offline-banner').toggleAttribute('hidden', navigator.onLine);
};
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void registerServiceWorker().catch(() => undefined); });
}

async function registerServiceWorker(): Promise<void> {
  const banner = $('#update-banner');
  const button = $<HTMLButtonElement>('#update-button');
  let refreshing = false;
  let updateRequested = false;
  const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
  const showUpdate = (): void => { if (registration.waiting) banner.removeAttribute('hidden'); };
  showUpdate();
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
    });
  });
  button.addEventListener('click', () => {
    if (!registration.waiting) return;
    button.disabled = true;
    button.textContent = 'Updating…';
    updateRequested = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !updateRequested) return;
    refreshing = true;
    window.location.reload();
  });
}

function updateMetadata(title: string, description: string, path: string): void {
  document.title = title;
  const canonicalPath = path === '/demo' || path === '/?demo=1' ? '/demo' : path;
  $<HTMLMetaElement>('#meta-description').content = description;
  $<HTMLMetaElement>('#og-title').content = title;
  $<HTMLMetaElement>('#og-description').content = description;
  $<HTMLMetaElement>('#twitter-title').content = title;
  $<HTMLMetaElement>('#twitter-description').content = description;
  $<HTMLLinkElement>('#canonical').href = `${ORIGIN}${canonicalPath}`;
}

function routeTo(url: string | URL, replace = false): void {
  const target = url instanceof URL ? url : new URL(url, location.href);
  if (replace) history.replaceState({}, '', `${target.pathname}${target.search}${target.hash}`);
  else history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`);
  renderCurrentRoute(true);
}

function focusRouteHeading(scroll = true): void {
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    heading.focus({ preventScroll: !scroll });
    $('#route-announcer').textContent = heading.textContent || '';
  });
}

function renderCurrentRoute(focus = false): void {
  teardownRoute?.();
  teardownRoute = null;
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => dialog.close());
  document.body.style.overflow = '';
  $('#demo-banner').setAttribute('hidden', '');
  $('#site-header').removeAttribute('hidden');
  $('#site-footer').removeAttribute('hidden');

  const url = new URL(location.href);
  const remoteCode = url.searchParams.get('remote');
  const demoMode = url.pathname === '/demo' || url.searchParams.get('demo') === '1';

  if (remoteCode && url.pathname === '/') {
    teardownRoute = renderPhoneRemote(remoteCode);
    updateMetadata(`Phone remote — Milkdrop Web`, 'Use this phone to control a paired Milkdrop Web display.', '/');
    if (focus) focusRouteHeading();
    return;
  }

  if (demoMode) {
    main.innerHTML = stageMarkup;
    const oldTitle = $('#demo-title');
    const heading = document.createElement('h1');
    heading.id = 'demo-title';
    heading.className = 'sr-only';
    heading.tabIndex = -1;
    heading.textContent = 'Sample music visualizer';
    oldTitle.replaceWith(heading);
    updateMetadata('Demo — Milkdrop Web', 'Try the Milkdrop Web visualizer with a bundled 120 BPM sample signal.', '/demo');
    teardownRoute = setupVisualizer(true);
    if (focus) focusRouteHeading(false);
    return;
  }

  const staticPage = getStaticPage(url.pathname);
  if (staticPage) {
    renderStaticPage(staticPage, url.pathname);
    if (focus) focusRouteHeading();
    return;
  }

  if (url.pathname === '/') {
    main.innerHTML = homeMarkup;
    updateMetadata(HOME_TITLE, HOME_DESCRIPTION, '/');
    teardownRoute = setupVisualizer(false);
    if (focus) {
      focusRouteHeading();
      if (url.hash) requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView());
    }
    return;
  }

  renderStaticPage(notFoundPage(url.pathname), url.pathname);
  if (focus) focusRouteHeading();
}

function renderStaticPage(page: StaticPage, path: string): void {
  main.innerHTML = page.html;
  updateMetadata(page.title, page.description, path);
  window.scrollTo(0, 0);
}

function renderPhoneRemote(code: string): () => void {
  main.innerHTML = `
    <section class="remote-page" aria-labelledby="page-title">
      <p class="effective">PHONE REMOTE</p>
      <h1 id="page-title" tabindex="-1">Control the paired display.</h1>
      <p class="room-label">Room <strong>${escapeHtml(code.toUpperCase())}</strong></p>
      <div class="connection-orbit" id="connection-orbit" aria-hidden="true"></div>
      <p id="phone-status" role="status" aria-live="polite">Connecting to the display…</p>
      <div class="remote-controls" aria-label="Visualizer controls">
        <button type="button" data-command="previous">Previous visual</button><button type="button" data-command="next">Next visual</button>
        <button type="button" data-command="toggle-auto">Change visuals automatically</button><button type="button" data-command="fullscreen">Enter full screen</button>
        <label class="select-label remote-palette" for="phone-palette">Color palette<select id="phone-palette"><option value="lichen">Lichen and pollen</option><option value="coral">Coral and moss</option><option value="moon">Moonlit cyanotype</option><option value="plum">Plum and foxglove</option></select></label>
        <label class="range-label remote-palette" for="phone-intensity"><span>Motion amount</span><output id="phone-intensity-output">75%</output></label><input class="remote-palette" id="phone-intensity" type="range" min="20" max="100" value="75" />
      </div>
      <p class="small-copy">This page sends control messages. The display handles its microphone audio.</p>
    </section>`;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const remote = new PhoneRemote();
  const status = $('#phone-status');
  const orbit = $('#connection-orbit');
  remote.addEventListener('connected', () => { status.textContent = 'Connected to the display.'; orbit.setAttribute('hidden', ''); }, options);
  remote.addEventListener('disconnected', () => { status.textContent = 'The display disconnected. Open its phone panel and scan again.'; orbit.setAttribute('hidden', ''); }, options);
  remote.addEventListener('failure', () => { status.textContent = navigator.onLine ? 'This room could not be reached. Check the code.' : 'Reconnect to the internet, then reload this page.'; orbit.setAttribute('hidden', ''); }, options);
  void remote.connect(code);
  document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button) => button.addEventListener('click', () => {
    remote.send({ type: button.dataset.command } as RemoteCommand);
    status.textContent = 'Control sent.';
  }, options));
  $('#phone-palette').addEventListener('change', (event) => remote.send({ type: 'palette', value: (event.target as HTMLSelectElement).value }), options);
  $('#phone-intensity').addEventListener('input', (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    $('#phone-intensity-output').textContent = `${value}%`;
    remote.send({ type: 'intensity', value });
  }, options);
  return () => { controller.abort(); remote.stop(); };
}

function setupVisualizer(demoMode: boolean): () => void {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const audio = new RoomAudio();
  const license = demoMode ? null : new LicenseManager();
  const stage = $<HTMLElement>('#stage');
  const landing = document.querySelector<HTMLElement>('#landing');
  const homePage = document.querySelector<HTMLElement>('#home-page');
  const header = $('#site-header');
  const footer = $('#site-footer');
  const canvas = $<HTMLCanvasElement>('#visual-canvas');
  const controlsDialog = $<HTMLDialogElement>('#controls-dialog');
  const remoteDialog = $<HTMLDialogElement>('#remote-dialog');
  const venueDialog = $<HTMLDialogElement>('#venue-dialog');
  const presetStrip = $('#preset-strip');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visualizer: Visualizer | null = null;
  let currentPreset = demoMode ? 0 : Number(localStorage.getItem('milkdrop:preset') || 0);
  let remote: ScreenRemote | null = null;
  let remoteUrl = '';
  let statusTimeout = 0;
  let lastReadout = 0;
  let frameCount = 0;
  let alive = true;

  const intensity = $<HTMLInputElement>('#intensity');
  const sensitivity = $<HTMLInputElement>('#sensitivity');
  const palette = $<HTMLSelectElement>('#palette-select');
  const autoRotate = $<HTMLInputElement>('#auto-rotate');
  const fourK = $<HTMLInputElement>('#four-k');
  const saved = demoMode ? {} : readPreferences();
  intensity.value = String(reduceMotion ? Math.min(saved.intensity ?? 35, 35) : (saved.intensity ?? 75));
  sensitivity.value = String(saved.sensitivity ?? 50);
  palette.value = saved.palette ?? 'lichen';
  autoRotate.checked = saved.autoRotate ?? !reduceMotion;
  fourK.checked = saved.fourK ?? false;
  updateOutputs();

  presetStrip.replaceChildren();
  PRESETS.forEach((preset, index) => {
    const button = document.createElement('button');
    button.className = `preset-chip${preset.premium ? ' locked' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')}: ${preset.name}${preset.premium ? ', Venue Pack' : ''}`);
    button.textContent = String(index + 1).padStart(2, '0');
    button.addEventListener('click', () => selectPreset(index), options);
    presetStrip.append(button);
  });
  if (PRESETS[currentPreset]?.premium && !license?.unlocked) currentPreset = 0;
  renderPreset();

  const start = async (sample = false): Promise<void> => {
    const button = document.querySelector<HTMLButtonElement>('#start-button');
    button?.setAttribute('aria-busy', 'true');
    if (button) button.textContent = sample ? 'Opening sample…' : 'Opening the microphone…';
    document.querySelector('#permission-help')?.setAttribute('hidden', '');
    try {
      if (!visualizer) visualizer = new Visualizer(canvas);
      applyTuning();
      if (sample) audio.startDemo(onFrame);
      else await audio.start(onFrame);
      $('#input-label').textContent = sample ? 'Sample track · 120 BPM' : 'Room microphone live';
      landing?.setAttribute('hidden', '');
      homePage?.setAttribute('hidden', '');
      header.setAttribute('hidden', '');
      footer.setAttribute('hidden', '');
      stage.removeAttribute('hidden');
      stage.dataset.mode = sample ? 'demo' : 'microphone';
      stage.dataset.started = 'true';
      document.body.style.overflow = 'hidden';
      if (sample) $('#demo-banner').removeAttribute('hidden');
      showStatus(sample ? 'Sample signal started' : 'Microphone opened');
    } catch (error) {
      audio.stop();
      visualizer?.destroy();
      visualizer = null;
      const message = error instanceof Error ? error.message : '';
      const permission = document.querySelector<HTMLElement>('#permission-help');
      if (permission) {
        $('#permission-title').textContent = message.includes('WebGL') ? 'The visual canvas could not start.' : 'The microphone stayed closed.';
        $('#permission-detail').textContent = message === 'unsupported' ? 'This browser does not offer microphone access. Use a current browser or try the sample.' : message.includes('WebGL') ? 'Turn on hardware acceleration or use another current browser.' : 'Allow microphone access in this site’s settings, then try again. You can also use the sample.';
        permission.removeAttribute('hidden');
      }
    } finally {
      button?.removeAttribute('aria-busy');
      if (button) button.innerHTML = '<span aria-hidden="true">●</span> Listen to the room';
    }
  };

  function onFrame(frame: AudioFrame): void {
    if (!alive) return;
    visualizer?.setAudio(frame);
    frameCount += 1;
    stage.dataset.frameCount = String(frameCount);
    stage.dataset.audioLevel = frame.level.toFixed(3);
    stage.dataset.beatCount = String(frame.beatCount);
    if (frame.phrase && autoRotate.checked) selectPreset(nextAvailable(currentPreset, 1));
    const now = performance.now();
    if (now - lastReadout > 180) {
      $('#beat-state').textContent = frame.bpm ? (frame.beat > .5 ? 'Beat found · downbeat' : 'Beat found') : 'Listening for the beat';
      $('#tempo-value').textContent = frame.bpm ? `${frame.bpm} BPM` : '— BPM';
      lastReadout = now;
    }
  }

  function selectPreset(index: number): void {
    const normalized = (index + PRESETS.length) % PRESETS.length;
    if (PRESETS[normalized].premium && !license?.unlocked) {
      openDialog(venueDialog);
      $('#license-message').textContent = demoMode ? 'Start for real to restore a Venue Pack license.' : `${PRESETS[normalized].name} is in the Venue Pack.`;
      return;
    }
    currentPreset = normalized;
    if (!demoMode) localStorage.setItem('milkdrop:preset', String(currentPreset));
    visualizer?.setPreset(currentPreset);
    renderPreset();
    showStatus(`${String(currentPreset + 1).padStart(2, '0')} · ${PRESETS[currentPreset].name}`);
  }

  function renderPreset(): void {
    $('#preset-number').textContent = String(currentPreset + 1).padStart(2, '0');
    $('#preset-name').textContent = PRESETS[currentPreset].name;
    document.querySelectorAll<HTMLButtonElement>('.preset-chip').forEach((button, index) => {
      button.setAttribute('aria-current', String(index === currentPreset));
      button.classList.toggle('locked', PRESETS[index].premium && !license?.unlocked);
    });
    visualizer?.setPreset(currentPreset);
    document.querySelectorAll<HTMLButtonElement>('.preset-chip')[currentPreset]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }

  function nextAvailable(from: number, direction: number): number {
    let next = from;
    do next = (next + direction + PRESETS.length) % PRESETS.length;
    while (PRESETS[next].premium && !license?.unlocked);
    return next;
  }

  function applyTuning(): void {
    audio.sensitivity = Number(sensitivity.value) / 100;
    visualizer?.setIntensity(Number(intensity.value) / 100);
    visualizer?.setPalette(palette.value);
    visualizer?.setHighResolution(fourK.checked && Boolean(license?.unlocked));
    stage.dataset.palette = palette.value;
    stage.dataset.intensity = intensity.value;
    stage.dataset.sensitivity = sensitivity.value;
    if (!demoMode) localStorage.setItem('milkdrop:preferences', JSON.stringify({ intensity: Number(intensity.value), sensitivity: Number(sensitivity.value), palette: palette.value, autoRotate: autoRotate.checked, fourK: fourK.checked }));
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
    if (demoMode) {
      routeTo('/');
      requestAnimationFrame(() => $<HTMLButtonElement>('#start-button').focus());
      return;
    }
    audio.stop();
    visualizer?.destroy();
    visualizer = null;
    remote?.stop();
    remote = null;
    stage.setAttribute('hidden', '');
    landing?.removeAttribute('hidden');
    homePage?.removeAttribute('hidden');
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
    } catch { showStatus('The browser blocked full screen'); }
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
      remote.addEventListener('ready', () => status.textContent = 'Ready. Scan with your phone camera.', options);
      remote.addEventListener('connected', () => { status.textContent = 'Phone connected.'; showStatus('Phone remote connected'); }, options);
      remote.addEventListener('disconnected', () => { status.textContent = 'Phone disconnected. Scan again to reconnect.'; }, options);
      remote.addEventListener('failure', () => { status.textContent = navigator.onLine ? 'This network blocked phone pairing. The local visualizer is still running.' : 'Phone pairing needs internet access.'; }, options);
      remote.addEventListener('command', (event) => handleRemote((event as CustomEvent<RemoteCommand>).detail), options);
    } catch {
      status.textContent = navigator.onLine ? 'Phone pairing could not start. Close this panel and try again.' : 'Phone pairing needs internet access.';
    }
  };

  function handleRemote(command: RemoteCommand): void {
    if (command.type === 'next') selectPreset(nextAvailable(currentPreset, 1));
    else if (command.type === 'previous') selectPreset(nextAvailable(currentPreset, -1));
    else if (command.type === 'toggle-auto') { autoRotate.checked = !autoRotate.checked; applyTuning(); showStatus(`Automatic changes ${autoRotate.checked ? 'on' : 'off'}`); }
    else if (command.type === 'fullscreen') void fullscreen();
    else if (command.type === 'palette') { palette.value = command.value; applyTuning(); showStatus('Color palette changed'); }
    else if (command.type === 'intensity') { intensity.value = String(command.value); updateOutputs(); applyTuning(); }
  }

  const updateLicenseUi = (): void => {
    if (!alive) return;
    $('#venue-tools').toggleAttribute('hidden', !license?.unlocked);
    renderPreset();
    if (license?.unlocked) $('#license-message').textContent = 'Venue Pack is active on this device.';
  };
  if (license) {
    license.addEventListener('change', updateLicenseUi, options);
    void license.initialize().then(updateLicenseUi);
  }
  updateLicenseUi();

  const restoreForm = $<HTMLFormElement>('#restore-form');
  restoreForm.toggleAttribute('hidden', demoMode);
  document.querySelector<HTMLButtonElement>('#start-button')?.addEventListener('click', () => void start(), options);
  document.querySelector<HTMLButtonElement>('#retry-button')?.addEventListener('click', () => void start(), options);
  document.querySelector<HTMLButtonElement>('#venue-section-button')?.addEventListener('click', () => openDialog(venueDialog), options);
  $('#previous-preset').addEventListener('click', () => selectPreset(nextAvailable(currentPreset, -1)), options);
  $('#next-preset').addEventListener('click', () => selectPreset(nextAvailable(currentPreset, 1)), options);
  $('#controls-button').addEventListener('click', () => openDialog(controlsDialog), options);
  $('#remote-button').addEventListener('click', () => void openRemote(), options);
  $('#fullscreen-button').addEventListener('click', () => void fullscreen(), options);
  $('#hide-button').addEventListener('click', toggleChrome, options);
  $('#show-controls').addEventListener('click', toggleChrome, options);
  $('#stop-button').addEventListener('click', stop, options);
  intensity.addEventListener('input', () => { updateOutputs(); applyTuning(); }, options);
  sensitivity.addEventListener('input', () => { updateOutputs(); applyTuning(); }, options);
  palette.addEventListener('change', applyTuning, options);
  autoRotate.addEventListener('change', applyTuning, options);
  fourK.addEventListener('change', applyTuning, options);
  $('#logo-file').addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !license?.unlocked) return;
    const image = $<HTMLImageElement>('#venue-logo');
    image.src = URL.createObjectURL(file);
    image.removeAttribute('hidden');
  }, options);
  $('#copy-remote').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(remoteUrl); $('#remote-status').textContent = 'Phone link copied.'; }
    catch { $('#remote-status').textContent = `Open this address on the phone: ${remoteUrl}`; }
  }, options);
  restoreForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!license) return;
    const message = $('#license-message');
    message.textContent = 'Checking this license…';
    try {
      const valid = await license.restore($<HTMLInputElement>('#license-input').value);
      message.textContent = valid ? 'Venue Pack restored. Four paid visuals are ready.' : 'That license is not active for Milkdrop Web. Check the key and try again.';
    } catch { message.textContent = 'The license service is unreachable. Reconnect and try again.'; }
  }, options);
  controlsDialog.addEventListener('close', applyTuning, options);
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    stage.dataset.fullscreen = String(active);
    $('#fullscreen-button').setAttribute('aria-label', active ? 'Leave full screen' : 'Enter full screen');
  }, options);

  window.addEventListener('keydown', (event) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as Element).tagName) || document.querySelector('dialog[open]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); selectPreset(nextAvailable(currentPreset, 1)); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); selectPreset(nextAvailable(currentPreset, -1)); }
    else if (event.key.toLowerCase() === 'f') void fullscreen();
    else if (event.key.toLowerCase() === 'h' && !stage.hasAttribute('hidden')) toggleChrome();
    else if (event.key.toLowerCase() === 'c' && !stage.hasAttribute('hidden')) openDialog(controlsDialog);
    else if (event.key.toLowerCase() === 'r' && !stage.hasAttribute('hidden')) void openRemote();
    else if (event.code === 'Space' && !stage.hasAttribute('hidden')) { event.preventDefault(); stop(); }
  }, options);

  if (demoMode) void start(true);

  return () => {
    alive = false;
    controller.abort();
    window.clearTimeout(statusTimeout);
    audio.stop();
    visualizer?.destroy();
    remote?.stop();
    document.body.style.overflow = '';
    restoreForm.removeAttribute('hidden');
  };
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

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-route]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = new URL(link.href, location.href);
  if (target.origin !== location.origin) return;
  event.preventDefault();
  routeTo(target);
});

document.querySelectorAll<HTMLButtonElement>('.dialog-close').forEach((button) => button.addEventListener('click', () => (button.closest('dialog') as HTMLDialogElement)?.close()));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
$('#reset-demo').addEventListener('click', () => routeTo('/?demo=1', true));
$('#start-real').addEventListener('click', () => routeTo('/'));
window.addEventListener('popstate', () => renderCurrentRoute(true));
history.scrollRestoration = 'manual';
renderCurrentRoute(false);
