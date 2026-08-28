# Milkdrop Web

Turn room music into full-screen botanical visuals for TVs and projectors.

Milkdrop Web is for party hosts, musicians, rehearsal rooms, and venues. Open the site and allow its microphone. No audio routing is needed.

[Try it with sample data](https://milkdrop-web.sociobot.in/?demo=1). The demo starts a bundled 120 BPM signal without asking for microphone access.

## Included features

- Eight free WebGL visuals and four Venue Pack visuals
- Visual choice, four color palettes, motion tuning, and microphone sensitivity
- Labelled touch controls and keyboard controls
- Full-screen mode and optional phone pairing
- An offline app shell that keeps the demo and visualizer available after the first visit
- A one-time $19 USD Venue Pack with four visuals, a session-only logo overlay, and a 3840 × 2160 canvas control

Microphone audio is analyzed in browser memory. It is not recorded, transcribed, stored, or uploaded. The app includes no trackers.

Phone pairing displays a room code. A failed connection leaves the local visualizer running and explains that pairing needs internet access.

## Demo sandbox

Open `/?demo=1` or `/demo`. Sample settings stay in memory. The demo does not read or change real preferences or license data.

Use **Reset demo** for a fresh sample. Use **Start for real** to discard the sample and return home.

See [`.factory/demo.md`](.factory/demo.md) for the verification contract.

## Run locally

Use a current LTS release of Node.js.

```bash
npm ci
npm run dev
```

## Test and build

```bash
npm test
npm run test:claims
npm run test:browser
npm run build
npm run audit
npm run audit:pwa
```

Every public product promise is listed in [`.factory/claims.json`](.factory/claims.json). Each entry names one tagged browser test.

The production command emits a static `dist/` root. It includes `index.html`, the service worker, and Azure routing with security headers. Initial JavaScript stays below 200 KB.

Deploy the contents of `dist/` as an Azure Static Web App. The repository does not manage DNS, billing, or infrastructure.

## Controls

- Left and right arrows: choose the previous or next visual.
- `F`: enter or leave full screen.
- `H`: hide or show controls.
- `C`: open visual settings.
- `R`: open phone pairing.
- Space: stop the visualizer and return to setup.

## Privacy and purchases

Read the in-product [privacy policy](https://milkdrop-web.sociobot.in/privacy) and [terms](https://milkdrop-web.sociobot.in/terms). Checkout uses only the Sociobot billing API.

## Project records

See [`.factory/brief.json`](.factory/brief.json) for scope. See [`.factory/design.md`](.factory/design.md) for visual decisions and asset provenance. See [`.factory/handoff.md`](.factory/handoff.md) for release evidence.

## License

MIT. See [LICENSE](LICENSE).
