# Independent verification — FAIL

Verified 2026-08-27 against candidate commit `d65f99710a354c322aeb5f80d44cc46bcf63c7f0` and production `https://milkdrop-web.sociobot.in`.

## Verdict

**FAIL — do not release this candidate as a complete product.** The free visualizer is functional, but the advertised paid checkout is broken and the shipped PWA does not meet its offline/update promise.

## Blocking defects

### High — Venue Pack purchase cannot begin

- Evidence: `GET https://api.sociobot.in/api/v1/products/milkdrop-web/checkout` returned `HTTP/2 404` with `{"error":"enabled factory product","status":404}` on 2026-08-27.
- Impact: the visible “Buy the venue pack — $19” control leads to a failed purchase, so the promised one-time Venue Pack cannot be bought. The builder handoff also identified that the factory must register the product; this verification confirms that it has not happened in production.
- Needed: register/enable the `milkdrop-web` production Sociobot product, configure its return URL, then exercise checkout and a returned license end to end.

### High — offline reload and ordinary PWA updates are not reliable

- Evidence: after installing the production service worker, its cache contained only `/`, `/fern.svg`, and `/manifest.webmanifest`. Clearing normal HTTP cache while retaining that service-worker cache, setting the browser offline, and reloading produced strict MIME errors for `/assets/index-7x7kDVTA.css` and `/assets/index-qVoqd_3A.js`: both were served the cached HTML fallback rather than their asset type. The app shell text appeared but scripts and styling did not load.
- Evidence: a two-version localhost deployment simulation used the candidate service worker unchanged while changing only `index.html`, matching a normal app-only release. `registration.update()` produced no waiting/installing worker and reload kept the old title (`Milkdrop Web — sound grows here`) rather than the changed build. The cache name is fixed as `milkdrop-web-v1` and the worker precaches no hashed app assets.
- Impact: this contradicts the app’s offline banner/promise and leaves deployed users stale across releases that do not also modify `sw.js`.
- Needed: version/precache the generated shell (HTML, CSS, entry JS and required chunks), use a release-derived cache revision, and rerun fresh-install, cache-cleared offline reload, and update tests.

## Other defects

### Medium — hashed production assets are not immutable cached

- `https://milkdrop-web.sociobot.in/assets/index-qVoqd_3A.js` returns `Cache-Control: public, must-revalidate, max-age=30`; the same is true of the document and service worker. This misses the static-web long-lived immutable caching requirement for content-hashed assets and amplifies the offline/update weakness.

### Medium — baseline clickjacking/script policy headers are absent

- Production supplies HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and a microphone-limited `Permissions-Policy`, but no `Content-Security-Policy` (including `frame-ancestors`) and no `X-Frame-Options` was returned. Add an appropriate CSP and frame-embedding policy after allowing the intentional PeerJS signalling and Sociobot billing origins.

## Passed checks and evidence

- Clean checkout: cloned the public `main` branch, detached exactly at `d65f99710a354c322aeb5f80d44cc46bcf63c7f0`; clean before install.
- Install/test/build: `npm ci` completed with 0 dependency vulnerabilities; `npm test` passed (3/3); `npm run build` passed (`tsc --noEmit` plus Vite) and produced `dist/`. No separate lint script exists.
- Budget: initial entry JS is 31.90 KB raw / 12.21 KB gzip and CSS 15.66 KB raw / 4.41 KB gzip, inside the 200 KB / 50 KB budgets. Lazy PeerJS chunks are excluded from first load.
- Deployment identity: SHA-256 values of live `index.html`, `assets/index-qVoqd_3A.js`, `assets/index-7x7kDVTA.css`, and `sw.js` match the candidate build exactly.
- Browser audit: `AUDIT_URL=https://milkdrop-web.sociobot.in npm run audit` passed. At 390 × 844 with reduced motion, landing and live-stage axe scans had zero serious/critical findings and zero console/page errors. The same local audit passed.
- Desktop product flow: at 1440 × 900 the primary target was 200 × 53 px; demo stage opened, ArrowRight changed specimen 01 to 02, `C` opened tuning, intensity boundary 20% updated its output, `H` hid/showed chrome, and Space stopped the stage and restored focus to `#start-button`.
- Mobile/reduced motion: at 390 × 844 reduced motion set intensity to 35% and phrase rotation off; no serious/critical axe findings or console/page errors.
- Mic/privacy normal and recovery paths: a browser media stub verified `getUserMedia` requests `autoGainControl: false`, `echoCancellation: false`, `noiseSuppression: false`, `channelCount: 1`, and `video: false`; the normal mic path entered the live stage without errors. Denied and unsupported mic inputs presented actionable recovery/preview guidance. Corrupt local preferences recovered without error. A malformed remote parameter was escaped (no injected image/markup).
- Remote/outbound requests: initial load contacted only the product origin. Opening optional phone pairing opened `wss://0.peerjs.com` for the disclosed PeerJS public signalling service; no microphone stream was sent. An invalid license token received the expected invalid-license recovery message and did not unlock Venue tools.
- Semantics/legal: landing and `/privacy`, `/terms`, `/about` have one h1 and a main landmark; title/lang, skip link, visible keyboard focus, responsive art alt text, privacy and terms routes are present.

## Scope note

No product source code was modified during this verification. The report and handoff update are the only repository changes.
