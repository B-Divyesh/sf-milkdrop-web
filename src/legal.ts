export interface StaticPage {
  title: string;
  description: string;
  html: string;
}

const privacy: StaticPage = {
  title: 'Privacy — Milkdrop Web',
  description: 'How Milkdrop Web handles microphone audio, preferences, phone pairing, and license checks.',
  html: `
    <article class="legal-page">
      <p class="effective">Effective 28 August 2026</p>
      <h1 id="page-title" tabindex="-1">Privacy, in plain language.</h1>
      <p>Milkdrop Web keeps microphone audio on the device running the visualizer.</p>
      <h2>Microphone audio</h2>
      <p>The browser provides a live microphone stream after you choose “Listen to the room.” Analysis happens in browser memory. The app does not record, upload, transcribe, or store that audio.</p>
      <p>Stopping the visualizer closes every microphone track.</p>
      <h2>Demo data</h2>
      <p>The demo uses a bundled sample signal. Demo settings stay in memory and are discarded when you leave or reset the demo. The demo does not read real preferences or license data.</p>
      <h2>Data stored on this device</h2>
      <p>Real-mode visual settings and a supplied Venue Pack license key use localStorage. A venue logo stays in the current browser session as a temporary object URL.</p>
      <p>Clear this data with your browser’s site-data controls.</p>
      <h2>Phone remote</h2>
      <p>Phone pairing is optional. PeerJS introduces the phone and display. Controls then travel through a WebRTC data channel. Network providers may see connection IP addresses.</p>
      <h2>Purchases</h2>
      <p>Sociobot and Dodo process checkout. Milkdrop Web sends a license key to Sociobot for verification at most once each day.</p>
      <h2>Analytics and contact</h2>
      <p>The app includes no advertising cookies, behavioral analytics, or trackers.</p>
    </article>`,
};

const terms: StaticPage = {
  title: 'Terms — Milkdrop Web',
  description: 'Terms for using Milkdrop Web and buying the optional Venue Pack.',
  html: `
    <article class="legal-page">
      <p class="effective">Effective 28 August 2026</p>
      <h1 id="page-title" tabindex="-1">Terms of use.</h1>
      <p>These terms apply when you use Milkdrop Web.</p>
      <h2>The service</h2>
      <p>Milkdrop Web renders visuals from sound measurements. It does not provide music or guarantee beat detection in every room.</p>
      <p>You are responsible for microphone permission, display safety, and music-performance rights at your venue.</p>
      <h2>Venue Pack license</h2>
      <p>The Venue Pack is a one-time $19 USD purchase for one buyer’s displays. It adds four visuals, a local logo overlay, and 4K canvas controls.</p>
      <p>The hosted checkout states final taxes and currency. Sociobot/Dodo is the merchant of record and handles eligible refunds. A refunded or revoked license stops paid access.</p>
      <h2>Safe use</h2>
      <p>Animated content can affect sensitive viewers. Use the reduced-motion setting when appropriate.</p>
      <p>Do not use the service unlawfully or disrupt its license and pairing services.</p>
      <h2>Warranty and liability</h2>
      <p>The software is provided “as is,” without warranties where the law permits. We are not liable for indirect loss, interrupted events, or device incompatibility.</p>
      <h2>Changes</h2>
      <p>A new effective date will identify material changes to these terms.</p>
    </article>`,
};

const about: StaticPage = {
  title: 'About the art — Milkdrop Web',
  description: 'How the original botanical visuals and launch artwork for Milkdrop Web were made.',
  html: `
    <article class="legal-page">
      <p class="effective">ART NOTES / 01</p>
      <h1 id="page-title" tabindex="-1">How the botanical visuals were made.</h1>
      <p>The twelve moving visuals are WebGL shader designs written for Milkdrop Web.</p>
      <h2>Launch artwork</h2>
      <p>The pressed-fern image was generated for this app on 27 August 2026. Param Factory used its Azure OpenAI image generator and reviewed the result before release.</p>
      <p>The source PNG and prompt record are kept in <code>assets/src/</code>. The optimized AVIF and WebP files are shipped from <code>public/assets/</code>.</p>
      <h2>Art direction</h2>
      <p>The field-guide style treats room sound as a living botanical sample. Deep evergreen keeps projector glare low, while paper panels make setup controls easy to read.</p>
      <p><a href="/" data-route>Return home</a></p>
    </article>`,
};

export function getStaticPage(path: string): StaticPage | null {
  if (path === '/privacy') return privacy;
  if (path === '/terms') return terms;
  if (path === '/about') return about;
  return null;
}

export function notFoundPage(path: string): StaticPage {
  return {
    title: 'Page not found — Milkdrop Web',
    description: 'This Milkdrop Web page could not be found.',
    html: `<section class="not-found-page"><p class="effective">MISSING SPECIMEN / 404</p><h1 id="page-title" tabindex="-1">This page is not in the field guide.</h1><p>There is no page at <code>${escapeHtml(path)}</code>.</p><a class="primary-button" href="/" data-route>Return home</a></section>`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}
