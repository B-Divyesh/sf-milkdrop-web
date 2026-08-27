const privacy = `
  <article class="legal-page">
    <p class="effective">Effective 27 August 2026</p>
    <h1 id="page-title">Privacy, in plain language.</h1>
    <p>Milkdrop Web is designed so the sensitive thing — sound in your room — stays in your room.</p>
    <h2>Microphone audio</h2>
    <p>Your browser gives the visualizer a live microphone stream only after you choose “Listen to the room.” Analysis happens in browser memory. We do not record, upload, transcribe, or store audio. Closing the visualizer or choosing “Stop listening” ends the stream.</p>
    <h2>What stays on your device</h2>
    <p>Your tuning preferences and, if supplied, Venue Pack license token are stored in localStorage. A venue logo is held only in the current browser session and is not uploaded. You can clear this data through your browser’s site-data controls.</p>
    <h2>Phone remote</h2>
    <p>Remote pairing is optional. PeerJS’s public signalling service introduces the phone and display; after that, small control messages travel over an encrypted WebRTC data channel. No microphone audio is sent. Network providers may see IP addresses required for the connection.</p>
    <h2>Purchases</h2>
    <p>The Sociobot billing API and its merchant of record, Dodo, process checkout. We send a license token to Sociobot to verify access, at most once per day. Their transaction records are governed by their own legal obligations.</p>
    <h2>Analytics and contact</h2>
    <p>There are no advertising cookies, behavioral analytics, or trackers in this app. Questions can be opened on the project’s public GitHub repository.</p>
  </article>`;

const terms = `
  <article class="legal-page">
    <p class="effective">Effective 27 August 2026</p>
    <h1 id="page-title">Terms of use.</h1>
    <p>These terms apply when you use Milkdrop Web. By using the app, you agree to them.</p>
    <h2>The service</h2>
    <p>Milkdrop Web provides locally rendered music-reactive visuals. It does not provide music, record audio, or guarantee beat detection in every acoustic environment. You are responsible for microphone permissions, display safety, and music-performance rights at your venue.</p>
    <h2>Venue Pack license</h2>
    <p>The Venue Pack is a one-time $19 USD purchase for one buyer’s displays. It unlocks four visual specimens, local logo overlay, and 4K controls. The hosted checkout states final taxes and currency. Sociobot/Dodo is the merchant of record and handles eligible refunds; a refunded or revoked license stops unlocking paid features.</p>
    <h2>Safe use</h2>
    <p>Visuals avoid rapid white flashing, but animated content can still affect sensitive viewers. Use reduced-motion controls when appropriate. Do not use the service unlawfully or attempt to disrupt its license or pairing services.</p>
    <h2>Warranty and liability</h2>
    <p>The software is provided “as is,” without warranties to the extent permitted by law. We are not liable for indirect loss, interrupted events, or incompatibility with a particular browser, network, or projector.</p>
    <h2>Changes</h2>
    <p>Material changes will be reflected by a new effective date on this page. Continued use after a change means you accept the revised terms.</p>
  </article>`;

const about = `
  <article class="legal-page">
    <p class="effective">Field notes 01</p>
    <h1 id="page-title">A visual instrument for the room.</h1>
    <p>Milkdrop Web is for parties, rehearsals, bars, and living rooms where the music is already playing and routing an audio source is the last thing anyone wants to debug.</p>
    <h2>How it listens</h2>
    <p>The analyser observes frequency energy and spectral change. An adaptive onset detector estimates the beat and groups pulses into sixteen-beat phrases. It does not identify songs, understand speech, or send samples elsewhere.</p>
    <h2>Original specimens</h2>
    <p>All twelve moving specimens are original WebGL shader work written for this product. The pressed-fern launch artwork was generated for Milkdrop Web on 27 August 2026 using the Param Factory’s Azure OpenAI image generator, then reviewed and optimized. It contains no brands, people, or copied characters.</p>
    <p><a href="/">Return to the field instrument</a></p>
  </article>`;

export function renderLegal(path: string): boolean {
  const content = path === '/privacy' ? privacy : path === '/terms' ? terms : path === '/about' ? about : '';
  if (!content) return false;
  const main = document.querySelector<HTMLElement>('#main');
  if (main) main.innerHTML = content;
  document.querySelectorAll<HTMLButtonElement>('#remote-header, #venue-header').forEach((button) => button.hidden = true);
  document.title = `${path === '/privacy' ? 'Privacy' : path === '/terms' ? 'Terms' : 'Field notes'} — Milkdrop Web`;
  return true;
}
