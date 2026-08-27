# Milkdrop Web — build handoff

## Independent verification 2 — PASS

**Candidate verified:** `171fcaf992f4dac9d8d3bb83cf19455a455a41f1`
**Live URL verified:** <https://milkdrop-web.sociobot.in/>
**Full evidence:** [`.factory/verification-2.md`](verification-2.md)

The candidate is **PASS**. A clean detached checkout passed install, unit tests, strict TypeScript build, local axe/browser checks, PWA offline/update audit, desktop and 390px keyboard/reduced-motion checks, and a live two-page PeerJS remote pairing. The live HTML, all 14 precached assets, service worker, and manifest matched the clean build byte-for-byte. Live headers/caching/CSP were also verified. No product-code changes were made during this verification.

One test-environment limitation remains: the headless fake microphone did not resolve a physical capture stream. The mic constraints, analyser tests, preview, denial/recovery, privacy boundary, and full browser flows were verified, but a real-device acoustic smoke test is still recommended before venue use. This is not a release-blocking product defect.

## Repair handoff — ready to deploy

Repaired from independent-verifier commit `50d66ab1a55e577e2807c7cab5ee1f179bcf771f` on 2026-08-27. The visualizer, microphone analysis, WebRTC pairing, and Sociobot/Dodo license contract were left intact.

### What changed

- `npm run build` now generates `dist/sw.js` after Vite emits the release. Its cache name is a 16-character SHA-256 release fingerprint and it precaches `index.html`, every emitted hashed JS/CSS chunk, the launch assets, manifest, icon, and static shell files. Navigation falls back only to cached `index.html`; missing asset requests are never answered with HTML.
- The manifest `start_url` receives the same release fingerprint. Changing even only `index.html` therefore changes both the worker and its cache version.
- An update installs into `waiting` state and the application presents an explicit, keyboard-focusable “Update now” control. Only that action sends `SKIP_WAITING`; `controllerchange` then reloads the page into the new shell. No unexpected mid-session activation occurs.
- `dist/staticwebapp.config.json` is emitted with immutable one-year caching for `/assets/*`, no-cache service-worker/manifest policies, a strict CSP including only the intended Sociobot and PeerJS connections, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, existing MIME protection, referrer policy, and microphone-only permissions policy.
- The existing checkout URL remains exactly `https://api.sociobot.in/api/v1/products/milkdrop-web/checkout`; no checkout was opened or purchase made.

## Delivered

- A production Vite + strict TypeScript static app, with output at `dist/index.html`.
- Eight free and four Venue Pack original WebGL specimens, all driven by local microphone FFT energy, adaptive spectral-flux onsets, tempo estimation, inferred downbeat emphasis, and 16-beat phrase events.
- Mic-first setup with AGC, echo cancellation, and noise suppression disabled; actionable denied/unsupported states and a no-microphone preview.
- Full-screen stage with preset strip, four pigment palettes, sensitivity and motion tuning, phrase-aware rotation, 4K mode, local logo overlay, reduced-motion defaults, and complete keyboard controls.
- Optional QR phone remote. PeerJS public signalling introduces the peers; encrypted WebRTC carries only small control messages. Audio remains on the display device.
- Sociobot one-time paid unlock at the required slug checkout URL, return-token capture, daily cached verification, optimistic offline unlock, invalid-license reconciliation, and paste-to-restore flow. Price copy is $19 USD; the factory still needs to register the production product.
- `/privacy`, `/terms`, and `/about` routes, PWA manifest/service worker, offline messaging, Azure Static Web Apps routing/security headers, robots and sitemap files.
- Original generated launch artwork in AVIF/WebP with 640 px and 960 px responsive sources. Source, prompt sidecar, review, and provenance are retained under `assets/src/` and `.factory/design.md`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run audit
npm run audit:pwa
```

`npm run audit` expects the preview at `http://127.0.0.1:4173` (override with `AUDIT_URL`) and a Playwright Chromium install. It checks the launch and live-stage views with axe, captures mobile screenshots under `/tmp`, visits every content route, and fails on serious/critical accessibility findings or browser console errors. `npm run audit:pwa` starts an isolated static server from `dist`, clears Chromium’s normal HTTP cache, installs the worker, reloads offline, asserts cached JS/CSS MIME types, then simulates an app-only `index.html` release and verifies the explicit update flow replaces the old title/shell.

Verification on 2026-08-27:

- `npm test`: 3/3 beat-analysis tests passed.
- `npm run build`: passed; `dist/index.html`, generated `dist/sw.js`, generated manifest build version, and `dist/staticwebapp.config.json` present. The generated worker precached 14 release files, including all five emitted hashed JS/CSS assets.
- `npm run audit:pwa`: passed fresh cache-cleared install/offline reload. Cached entry JS returned `text/javascript; charset=utf-8`; cached entry CSS returned `text/css; charset=utf-8`. Its app-only update simulation showed the update toast, required its button, and reloaded into the changed shell.
- `npm run audit`: passed with zero landing/live-stage axe violations at serious/critical level and zero browser console/page errors.
- Live, non-purchasing header/checkout checks: `GET https://api.sociobot.in/api/v1/products/milkdrop-web/checkout` returned `303` to Dodo checkout without following it, confirming the production $19 product is registered. The currently deployed site still returns the previous 30-second asset cache policy and lacks CSP/frame headers; deployment of this commit is required before the new `dist/staticwebapp.config.json` can be observed live.
- Initial app JS: 31.90 KB raw / 12.21 KB gzip (lazy remote chunks excluded); CSS: 15.66 KB raw / 4.41 KB gzip.
- Largest responsive hero: 90.74 KB WebP / 70.79 KB AVIF; mobile variants: 37.51 KB / 27.90 KB.
- Playwright + axe at 390 × 844 with reduced motion: zero landing violations, zero live-stage violations, zero console/page errors; WebGL shader compiled and rendered.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, total blocking time 10 ms. INP was not measured because the synthetic run had no qualifying interaction; the 10 ms TBT and direct event handlers remain comfortably inside the 200 ms interaction budget.
- Manual visual review: launch sheet and live fern preset checked at 390 px; content remains readable, controls remain at least 44 px, and safe-area padding is applied to fixed stage chrome.

## Known gaps and operational notes

- A static site cannot own a signalling relay. Phone pairing therefore depends on PeerJS’s free public signalling service and may fail on networks that block WebRTC; failure is explained without affecting the visualizer. A factory-operated signalling endpoint would improve venue reliability later.
- Beat/downbeat detection is intentionally heuristic and microphone-based; reverberant rooms, speech-heavy audio, or very soft material can delay tempo lock. The sensitivity control is available for correction.
- “Cast-friendly” means using the browser or operating system’s native Chromecast tab/AirPlay screen-mirroring UI; the app does not call a proprietary casting SDK.
- 4K mode is device-dependent and intentionally opt-in because older TV browsers can overheat or drop frames.
- Deployment is outside this repository. After the factory deploys this committed `dist`, rerun the live header curl checks to confirm Azure serves immutable `/assets/*`, no-cache `/sw.js`, CSP, and frame protection. No product ID or payment-provider secret is embedded here.
