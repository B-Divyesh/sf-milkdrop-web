# Independent verification 2 — PASS

**Verified:** 2026-08-27 UTC
**Candidate:** `171fcaf992f4dac9d8d3bb83cf19455a455a41f1` (`factory: repair milkdrop-web-repair-1`)
**Production URL:** <https://milkdrop-web.sociobot.in/>
**Method:** clean detached worktree at `/tmp/milkdrop-web-verify-2`; no product source was changed.

## Verdict

**PASS.** The deployed static app is the exact production build of the candidate and meets the researched v1 job: it opens as a mic-first, full-screen, beat-aware visualizer, has a usable no-mic recovery preview, local tuning/keyboard controls, an actual paired phone remote, and the required privacy/payment/legal surfaces.

## Reproducible local checks

```sh
git worktree add --detach /tmp/milkdrop-web-verify-2 171fcaf992f4dac9d8d3bb83cf19455a455a41f1
cd /tmp/milkdrop-web-verify-2
npm ci
npm test
npm run build
npm run audit:pwa
npm run preview -- --host 127.0.0.1
# in another terminal
npm run audit
```

- `npm ci`: completed, 96 packages audited, **0 vulnerabilities**.
- `npm test`: **3/3 passed** (`src/audio-analysis.test.ts`).
- `npm run build`: passed strict `tsc --noEmit`, Vite production build, and service-worker generation. There is no lint script in `package.json`.
- `npm run audit:pwa`: passed offline shell reload, cached JS/CSS MIME validation, and the explicit waiting-worker/update-now flow.
- `npm run audit`: passed locally at 390 × 844 with reduced motion: no serious/critical axe violations and no console/page errors.
- Desktop (1440 × 900) landing and live preview were separately checked with axe: no violations and no console/page errors.

## Product exercise

| Case | Evidence | Result |
| --- | --- | --- |
| Normal visualizer path | The production preview enters the WebGL stage, provides 12 preset buttons, tuning, fullscreen, stop, and phrase-aware demo audio. `audio.ts` calls `getUserMedia` with `autoGainControl`, `echoCancellation`, and `noiseSuppression` all `false`. | Pass |
| Permission denial and recovery | At 390 × 844, a simulated `NotAllowedError` exposed the useful retry/no-mic message; Preview opened the stage. Malformed saved preferences (`{invalid`) recovered to defaults; reduced motion set intensity to 35%. | Pass |
| Keyboard and focus | In the preview, ArrowRight changed preset, `C` opened tuning, Escape closed it, `H` hid/restored chrome, and Space stopped. Focus returned to `#start-button` with a visible `3px solid` outline. | Pass |
| Phone remote | Against production, display preview created a six-character room; a second production page connected, then `Next specimen` changed the display from **02** to **03**. No console/page errors. | Pass |
| Malformed input | `?remote=<img src=x onerror=alert(1)>` rendered as text (`Room <IMG …>`); no injected image or script execution. A malformed license token returned the in-app inactive-token message without errors. | Pass |
| Offline/PWA update | Fresh worker install, offline reload, cached CSS/JS types, and an app-only release update all passed. Update requires the explicit accessible **Update now** button. | Pass |
| Paid path, without purchase | Required checkout endpoint returned HTTP **303** to hosted Dodo checkout; invalid verification returned HTTP **200** `{ "valid": false, "reason": "invalid" }`. No purchase was initiated. | Pass |

The headless fake microphone did not resolve a physical capture stream, so hardware microphone capture and acoustical beat-lock were not claimed as directly measured. This is an environment limitation, not a browser error: source constraints, the analyser unit tests, demo-stage behavior, denial/recovery flow, and local-only stream handling were independently checked. A final real-device mic smoke test is prudent before a venue event.

## Deployment identity, privacy, and security

- The live `index.html` SHA-256 was identical to the clean build: `8e134b30e4e2731ab10926ad112db09b30aeef07ad099988da73aa56f30815de`.
- All **14/14** assets in the candidate service-worker precache were byte-identical live; live `sw.js` and `manifest.webmanifest` were also identical.
- A normal production landing load contacted only `https://milkdrop-web.sociobot.in`. Opening the optional remote additionally contacted only the disclosed `https://0.peerjs.com` signalling service. License verification uses the disclosed `https://api.sociobot.in`; no analytics/tracker requests or CDN fonts/scripts were observed.
- Code review confirms microphone data stays in the browser `MediaStream`/`AnalyserNode`; it is neither fetched nor recorded. Stored local data is preset/preferences and, only if supplied, a license token/verdict. The privacy page accurately discloses this and the PeerJS IP/signalling boundary.
- Live responses supplied HSTS, CSP (self-only assets; only Sociobot and PeerJS connections), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and microphone-only permissions policy. Hashed JS used `public, max-age=31536000, immutable`; `sw.js` was `no-cache, no-store, must-revalidate`; manifest was `no-cache`.

## Accessibility and performance

- Semantic smoke checks: `lang=en`, title, one `<h1>` per route, main landmark, skip link, labelled controls, alt text, privacy/terms/about routes, and designed focus states all present.
- Axe serious/critical findings: **0** on local mobile landing/live preview, local desktop landing/live preview, and the live mobile landing/live preview. Console/page errors: **0** in those exercises.
- Initial app JS is **32.48 KB raw / 12.41 KB gzip** (plus 0.17 KB helper); CSS is **16.28 KB raw / 4.50 KB gzip**. Both are far below the 200 KB JS / 50 KB CSS static budgets. The mobile hero is **27.90 KB AVIF** or **37.51 KB WebP**, below the 300 KB budget. Remote-only code is lazy.
- A direct Lighthouse attempt could not complete in this container because the installed Chrome-for-Testing closed its DevTools target when Lighthouse attached. This did not affect the Playwright/aXe/PWA results above; no Lighthouse score is asserted by this verification.

## Defects by severity

None found.

## Follow-up notes

- The optional remote depends on public PeerJS signalling and WebRTC; networks that block either will prevent pairing, while the visualizer itself continues to work. This is disclosed in-product.
- Perform the real-device microphone/acoustic smoke noted above when a microphone-equipped test device is available.
