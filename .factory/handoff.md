# Milkdrop Web — build handoff

## Independent verification verdict — FAIL

Verified 2026-08-27 at commit `d65f99710a354c322aeb5f80d44cc46bcf63c7f0` against `https://milkdrop-web.sociobot.in`.

The free visualizer's clean install, tests, strict production build, desktop/mobile keyboard flows, mic constraints/recovery, and axe browser audits pass. The live HTML, entry JS, CSS, and service worker match the candidate byte-for-byte.

**Release is blocked** by two high-severity defects:

- The displayed Venue Pack checkout URL returns `HTTP 404 {"error":"enabled factory product","status":404}`. The production Sociobot product must be registered/enabled and its full checkout/return-license flow retested.
- The PWA precaches only `/`, `/fern.svg`, and `/manifest.webmanifest`. With HTTP cache cleared, an offline reload serves HTML for the missing CSS/JS assets and fails strict MIME loading. An app-only update with unchanged `sw.js` also leaves users on the old cached shell. Precache/version all required hashed shell assets and rerun fresh-install, offline, and update tests.

See `.factory/verification.md` for exact commands, results, remaining medium findings (non-immutable hashed-asset caching and missing CSP/frame policy), and remediation evidence required for a PASS.

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
```

`npm run audit` expects the preview at `http://127.0.0.1:4173` (override with `AUDIT_URL`) and a Playwright Chromium install. It checks the launch and live-stage views with axe, captures mobile screenshots under `/tmp`, visits every content route, and fails on serious/critical accessibility findings or browser console errors.

Verification on 2026-08-27:

- `npm test`: 3/3 beat-analysis tests passed.
- `npm run build`: passed; `dist/index.html` present.
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
- The factory must register `milkdrop-web` in Sociobot billing before checkout and verification can succeed in production. No product ID or payment-provider secret is embedded here.
