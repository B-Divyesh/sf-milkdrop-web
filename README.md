# Milkdrop Web

Mic-driven, beat-aware visuals for parties, jam rooms, bars, TVs, and projectors. Open the site, let the browser listen to the room, and run a full-screen visual instrument without routing Spotify, a mixer, or an audio file into it.

Live: [milkdrop-web.sociobot.in](https://milkdrop-web.sociobot.in)

## What ships

- Twelve original WebGL botanical specimens: eight free and four in the Venue Pack
- Local FFT, adaptive onset detection, tempo estimate, downbeat emphasis, and 16-beat phrase rotation
- Phone remote over an encrypted WebRTC data channel, paired by QR or room link
- Four palettes, motion and microphone tuning, keyboard operation, and full-screen mode
- Optional one-time $19 Venue Pack with rare specimens, a local-only logo overlay, and 4K tuning
- Installable/offline-capable app shell with no tracking or third-party runtime assets

Microphone audio is analysed only in browser memory. It is never recorded or uploaded. The optional remote uses PeerJS’s public signalling service for connection setup; only control messages are sent.

## Run locally

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Microphone access requires `localhost` or HTTPS. To use the phone remote, both browsers need internet access for signalling and a network that permits WebRTC.

## Test and build

```sh
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`. It writes a static site to `dist/`, with `dist/index.html` at the deploy root. Azure Static Web Apps routing and security headers are in `public/staticwebapp.config.json`.

## Controls

- Left/right arrows: previous/next specimen
- `F`: enter or leave full screen
- `H`: hide or show chrome
- `C`: open tuning controls
- `R`: open phone pairing
- Space: stop listening and return to setup

On touch screens, all functions are available through labelled controls. If microphone access fails, the launch sheet explains how to retry and offers a no-mic preview.

## Architecture

Vite and strict vanilla TypeScript keep the initial bundle small. Web Audio provides raw frequency data with AGC, echo cancellation, and noise suppression explicitly disabled. The renderer is a compact original WebGL fragment shader; dependencies for QR generation and WebRTC load only when remote pairing opens. Preferences and license state are local-first.

The researched scope is in `.factory/brief.json`, visual decisions and generated-asset provenance are in `.factory/design.md`, and release verification is in `.factory/handoff.md`.

## License

MIT. See [LICENSE](LICENSE).
