# Review 3 — Turn room music into full-screen visuals

## Verdict: FAIL

Reviewed 5 September 2026 UTC against implementation commit `ada4cc4194323a43278a3b766455637319afe05b`, documentation baseline `b535fefa6a415208f1b506e1e544aa495e42ea13`, and <https://milkdrop-web.sociobot.in>.

There are **two findings**: one high and one medium. There are **zero untested public claims**. All eleven declared claim commands passed separately from a clean checkout, but a PASS requires zero findings of every severity.

No product source was changed during this review. The pre-existing modified `graphify-out` files were not touched or staged.

## Job, audience, and first action

Milkdrop Web turns room music into full-screen visuals for party hosts, musicians, and venues using a TV or projector. The first actions are **Listen to the room** for real microphone use and **Try it with sample data** for the one-click sample.

Fresh reduced-motion Chromium contexts checked the live page before scrolling:

| Viewport | Job and audience | First actions | Next step and three facts | Load errors |
| --- | --- | --- | --- | ---: |
| 390 × 844 phone | Visible | Both visible | Last fact ends at 673 px | 0 |
| 1440 × 900 desktop | Visible | Both visible | Last fact ends at 727 px | 0 |

Screenshots are `/work/.evidence/milkdrop-web-review-3/live-first-phone.png` and `/work/.evidence/milkdrop-web-review-3/live-first-desktop.png`.

## Findings

### F-3-1 — HIGH — invalid saved settings disable the real visualizer

- Location: `src/main.ts:287`, `src/main.ts:300-305`, and `src/main.ts:390-392`.
- Reproduction: in a fresh live browser context, set `milkdrop:preset` to `invalid`, `-1`, or `12`, then open `/`. Each value throws **“Cannot read properties of undefined (reading 'name')”**. Setting `milkdrop:preferences` to the valid JSON value `null` throws **“Cannot read properties of null (reading 'intensity')”**.
- Observable impact: initialization stops before the click and keyboard listeners are registered. **Listen to the room** remains visible but does nothing, the stage stays closed, and reload repeats the failure. Leaving a healthy demo through **Start for real** reaches the same error when an invalid real preset is stored.
- Why this matters: a returning user with stale or damaged local state cannot do the core job and gets no recovery message or reset action. The previous corrupt-preferences check covered malformed JSON, which the `catch` handles, but not valid JSON with the wrong shape or an invalid preset index.
- Required fix: validate the stored object shape and every value before use. Clamp or replace invalid preset indexes, palettes, ranges, booleans, and non-object preference values with defaults. Add browser tests for direct home load and **Start for real** with malformed, null, negative, and out-of-range saved values.

### F-3-2 — MEDIUM — the offline notice is obscured on a phone demo

- Location: the fixed banner rules in `src/style.css`, including the fixed `2.5rem` offset used when the offline and demo banners are both visible.
- Reproduction: open the live demo at 390 × 844, install its service worker, go offline, and reload. The offline banner spans y=0–88 px, while the demo banner starts at y=40 px and ends at 104 px. They overlap by 48 px.
- Observable impact: the demo banner covers the lower part of **“You’re offline. The demo and visualizer still work. Phone pairing and license checks need internet.”** The screenshot at `/work/.evidence/milkdrop-web-review-3/live-offline-phone.png` shows the clipped recovery information.
- Why this matters: offline state is a promised, first-class state, and the network limits are hidden at the phone width the product targets. The visualizer itself remains usable offline.
- Required fix: stack notices using normal layout or a measured shared offset instead of assuming the offline notice is one 40 px line. Add 320 px and 390 px tests asserting that the offline, demo, header, and stage regions do not overlap.

## Demo and real-data isolation

- `/?demo=1` and `/demo` open directly into a populated visualizer with **Fern echo**, **120 BPM**, rendered frames, and working controls.
- The persistent banner says **“Demo — sample data, nothing is saved”** and includes **Reset demo** and **Start for real**.
- ArrowRight changed the live sample to **Pollen orbit**. Reset restored **Fern echo** and the lichen palette.
- A valid real preset, preference object, and license sentinel remained byte-for-byte unchanged during sample use and Reset. Demo traffic stayed on `https://milkdrop-web.sociobot.in`.
- Start for real discarded the healthy sample and returned to `/`. F-3-1 covers the separate invalid-real-state case.
- Screenshot: `/work/.evidence/milkdrop-web-review-3/live-demo-phone.png`.

## Every declared claim

Clean detached checkout: `/tmp/milkdrop-web-review-3-clean` at `ada4cc4194323a43278a3b766455637319afe05b`. `npm ci` installed 97 packages with zero vulnerabilities. Every command from `.factory/claims.json` was run as a separate process.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sample` | Pass | Bundled 120 BPM frames reached 16 beats and changed the visual. |
| `demo-isolation` | Pass | Seeded real keys were unchanged; demo requests stayed same-origin. |
| `microphone-privacy` | Pass | Required microphone constraints were used; no recorder, speech API, audio storage, upload, or live track remained after Stop. |
| `offline-reload` | Pass | A service-worker-controlled demo reloaded offline and changed visual. |
| `visual-count` | Pass | Eight free controls were selectable and four paid controls stayed locked. |
| `venue-pack` | Pass | A cached sandbox entitlement enabled the session logo and 3840 × 2160 control; an inactive verdict relocked them. |
| `license-verification-cadence` | Pass | Controlled time allowed one request inside 24 hours and another at the boundary. |
| `controls-access` | Pass | Touch controls and all documented keys changed the stated visible state and restored focus. |
| `phone-pairing` | Pass | A second page changed the display; blocked networking left the local visualizer running with recovery text. |
| `art-provenance` | Pass | Generator, date, source path, and shipped asset path were present. |
| `static-build` | Pass | The static root, worker, Azure configuration, headers, and initial-JavaScript limit were present. |

The landing page, dialogs, legal pages, 404, and README were cross-checked against the registry. No missing, false, incomplete, or untested public claim was found. F-3-1 and F-3-2 are behavior and layout defects, not untested marketing promises.

## Clean-checkout and live checks

| Check | Result |
| --- | --- |
| `npm test` | Pass, 3/3 unit tests |
| `npm run build` | Pass; `dist/` contains the app, worker, and Azure configuration |
| `npm run test:browser` | Pass, 22/22 browser tests |
| `npm run audit` with the built preview running | Pass; zero axe violations, zero overflow, one h1, and no console errors on all audited routes |
| `npm run audit:pwa` | Pass; offline shell, asset MIME types, and explicit update flow |
| `git diff --check` | Pass |
| Live `verify-url.sh` | Pass; HTTP 200, title, `lang=en`, main, one h1, alt text, labels, and no load errors |
| Live Lighthouse mobile | Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms |

`npm run audit` is an against-server audit. A direct call with no preview server returned `ERR_CONNECTION_REFUSED`; after starting `npm run preview -- --host 127.0.0.1`, the audit passed. All declared claim commands start their own test server and passed from the clean checkout.

The production build emitted 38.14 KB of initial application JavaScript raw (13.98 KB gzip) and 21.42 KB CSS raw (5.50 KB gzip). The live and clean-built `index.html` SHA-256 values are both `e3d67dc6189d8fc71e4170e3564eabc74d0e36ff0518084b716e2f4061080c28`.

## Normal, boundary, error, and recovery paths

- A deterministic live microphone stub opened the real stage, requested `autoGainControl`, `echoCancellation`, and `noiseSuppression` as `false`, and stopped every track. Its traffic stayed same-origin and it used no recorder or speech API.
- Reduced motion set motion to 35% and automatic changes off. Arrow keys, C, Escape, H, F, Space, touch controls, dialog focus return, and stop-to-start focus passed in the browser suite.
- A denied microphone showed **“The microphone stayed closed”**, a retry action, and a sample fallback. The fallback opened the 120 BPM sample without errors.
- A live phone paired through the displayed six-character room code and changed the display from **Fern echo** to **Pollen orbit**. The declared failure-path test also passed.
- An invalid license query was removed from the address bar, stayed locked, and produced **“That license is not active for Milkdrop Web. Check the key and try again.”**
- A markup-shaped `remote` query was rendered as text, created no image, and caused no browser error.
- F-3-1 records the failed invalid stored-state paths. Minimum and maximum normal control paths remain covered by the passing browser and claim suites.

## Accessibility, privacy, offline behavior, and site structure

- The live Playwright axe audit found zero violations on phone and desktop home, demo, privacy, terms, about, and 404 documents. All audited pages had one h1, one main landmark, visible standard shell, sufficient touch targets, and no horizontal overflow.
- Skip navigation, visible focus, dialog focus return, route announcements, and Back/Forward state worked. Live Back restored scrollY 2143 and footer Privacy focus; Forward restored scrollY 320 and the Privacy h1 focus.
- Normal home, demo, and stubbed microphone traffic used only the product origin. Phone pairing used the disclosed PeerJS connection service. License verification used the disclosed Sociobot endpoint.
- The live response supplies CSP with header-only `frame-ancestors`, HSTS, frame denial, MIME protection, strict-origin referrer policy, and a microphone-only permissions policy.
- `/`, `/demo`, `/privacy`, `/terms`, `/about`, robots, sitemap, manifest, and worker returned HTTP 200. A deliberately unknown route returned the designed HTTP 404 with its own title, h1, metadata, standard shell, and return actions. This expected 404 is not a defect.
- Every discovered internal link returned HTTP 200 except the deliberate unknown-route skip link, which correctly remained HTTP 404. GitHub returned HTTP 200. The explicitly marked checkout returned the expected HTTP 303 hosted-checkout redirect; no purchase was started.
- The offline demo reloaded, rendered, and changed visual without console errors. F-3-2 is limited to the overlapping phone notices. The local PWA audit proved the explicit app-only update flow.

## Earlier finding disposition

All earlier review and verification files were inspected, including minor findings.

| Earlier finding set | Current disposition |
| --- | --- |
| Review 1 B1–B4 | Fixed: clear first screen, one-click isolated demo, claims registry, and designed HTTP 404 all pass. |
| Review 1 H1–H3 | Fixed: route metadata, History API focus/scroll, complete landing order, route shells, and desktop first-screen fit all pass. |
| Review 1 M1–M4 and L1 | Fixed: copy length, plain terminology, consistent control names, result-naming actions, and external-link labels pass current inspection. |
| Review 1 U01–U45 | Closed: claims were removed, rewritten, or mapped to the eleven passing claim tests. No current unlisted public claim was found. |
| Verification 1 purchase, PWA, caching, and security findings | Fixed: checkout redirects, offline/update audit passes, immutable asset caching is configured, and live security headers are present. |
| Verification 2 | Passed previously; its covered normal, denial, privacy, pairing, legal, and deployment checks still pass. |
| Review 2 F-2-1–F-2-5 | Fixed: complete static 404 metadata, restored history position/focus, consistent shell and first-screen fit, plain copy, and the daily license-verification claim all pass. |
| Verification 3 | Its reported normal paths and eleven claims reproduce. F-3-1 adds wrong-type and out-of-range persistent-state cases; F-3-2 adds measured visual overlap while offline on a phone. |

## Test limits

The container has no physical microphone, so acoustic room capture was exercised with deterministic Web Audio and microphone stubs rather than hardware. No paid purchase was made; checkout reachability, price copy, entitlement controls, returned-token handling, and invalid-license recovery were checked without a charge. These limits do not leave a public claim untested.

## Evidence

- Screenshots and Lighthouse JSON: `/work/.evidence/milkdrop-web-review-3/`
- Live URL check: `/tmp/milkdrop-live-review-3/`
- Clean checkout: `/tmp/milkdrop-web-review-3-clean`
- Review copy: `/work/.evidence/qa-report.md`
- Machine result: `/work/.evidence/qa-result.json`
