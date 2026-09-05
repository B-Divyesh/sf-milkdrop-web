# Verification 3 — Turn room music into full-screen visuals

**Verdict: PASS**

Verified 2026-09-05 UTC against implementation commit `ada4cc4194323a43278a3b766455637319afe05b` and live production at <https://milkdrop-web.sociobot.in>. The later documentation commit is `e8ade7a9fe0a1e39a520c2474da4cf0f441790e1`.

There are **zero findings** and **zero untested public claims**. No product source was changed during this verification.

## Job, audience, and first action

Milkdrop Web turns room music into full-screen visuals for party hosts, musicians, and venues using a TV or projector. The first actions are **Listen to the room** for microphone use and **Try it with sample data** for the one-click sample.

Fresh reduced-motion Chromium contexts checked the live site before scrolling:

| Viewport | Job and audience | First actions | Guidance and three facts visible | Console errors |
| --- | --- | --- | --- | --- |
| 390 × 844 phone | Present | Both present | Ends at 673 px | 0 |
| 1440 × 900 desktop | Present | Both present | Ends at 727 px | 0 |

Screenshots: `/tmp/milkdrop-verify-3-phone.png` and `/tmp/milkdrop-verify-3-desktop.png`.

## Candidate and live identity

- Clean detached checkout: `/tmp/milkdrop-web-verify-3` at `ada4cc4194323a43278a3b766455637319afe05b`.
- `npm ci` passed with 97 packages installed and zero vulnerabilities.
- The live and clean-built `index.html` SHA-256 values both equal `e3d67dc6189d8fc71e4170e3564eabc74d0e36ff0518084b716e2f4061080c28`.
- `/opt/fleet/lib/verify-url.sh https://milkdrop-web.sociobot.in /tmp/milkdrop-verify-3-live` passed: HTTP 200, title, `lang=en`, one h1, main landmark, complete image alt attributes, labelled buttons, and no browser console errors.

## Clean-checkout checks

| Command | Result |
| --- | --- |
| `npm test` | Pass, 3/3 unit tests |
| `npm run build` | Pass; emits `dist/` including `index.html`, `sw.js`, and `staticwebapp.config.json` |
| `npx playwright test tests/product.spec.ts` | Pass, 11/11 browser structure, route, focus, touch-size, and axe tests |
| `npm run audit` | Pass; mobile and desktop home plus demo, privacy, terms, about, and 404 have zero axe violations, zero overflow, one h1, and zero console errors |
| `npm run audit:pwa` | Pass; offline reload, cached JavaScript/CSS MIME types, and explicit app-only update flow |
| `git diff --check` | Pass |

The standalone `@axe-core/cli` could not start because its Selenium wrapper could not find a system Chrome binary in this container. This is not a product result: the repository's pinned Playwright Chromium and `@axe-core/playwright` scans passed on all routes above, as did the live browser smoke check.

Build output remains within budget: initial application JavaScript is 38,140 bytes raw / 13,915 bytes gzip, and CSS is 21,417 bytes raw / 5,516 bytes gzip.

## Every declared claim

Every command in `.factory/claims.json` was run separately from the clean checkout. Each passed.

| Claim | Command result and observable result |
| --- | --- |
| `demo-sample` | Pass: the bundled 120 BPM sample renders, reaches phrase change, and changes visual. |
| `demo-isolation` | Pass: seeded real preferences and license data remain unchanged; only the product origin is requested. |
| `microphone-privacy` | Pass: local analysis uses the stated microphone constraints; no recording, speech API, storage, upload, or open track after stop. |
| `offline-reload` | Pass: a fresh service-worker-controlled demo reloads offline and changes visual. |
| `visual-count` | Pass: eight free visuals are selectable and the four additional visuals are locked. |
| `venue-pack` | Pass: sandbox entitlement enables local logo and 3840 × 2160 control; inactive entitlement locks them. |
| `license-verification-cadence` | Pass: controlled time permits one request inside 24 hours and the next at the boundary. |
| `controls-access` | Pass: labelled touch controls and documented keys change visible state and return focus. |
| `phone-pairing` | Pass: a second page changes the display visual; blocked networking leaves the visualizer running with recovery text. |
| `art-provenance` | Pass: generator, date, source, and shipped asset locations are published. |
| `static-build` | Pass: static root, service worker, Azure configuration, headers, and initial JavaScript limit are present. |

## Live product exercise

- Entering `/?demo=1` in a fresh phone context immediately started the populated visualizer (`Fern echo`, `120 BPM`, running stage). The persistent banner read **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**.
- Changing the visual produced `Pollen orbit`; Reset restored `Fern echo`. Seeded `milkdrop:preset`, `milkdrop:preferences`, and `sb_license:milkdrop-web` values stayed byte-for-byte unchanged. Requests during the demo went only to `https://milkdrop-web.sociobot.in`. Screenshot: `/tmp/milkdrop-verify-3-demo-phone.png`.
- On the live sample, ArrowRight chose `Pollen orbit`, `C` opened settings, Escape closed it, and Space returned home with focus on `#start-button`.
- A denied microphone produced **“The microphone stayed closed.”**, a concrete retry action, and the sample fallback. A malformed `remote` query string created no image node or page error.
- A fresh service-worker context reloaded the live demo offline, showed the offline banner, and changed to `Pollen orbit` without console errors.
- `/privacy`, `/terms`, and `/about` returned HTTP 200 with route-specific titles, one visible header, one visible footer, and one h1. A deliberately unknown URL returned the designed HTTP 404 with matching shell and complete social/touch metadata. The deliberate 404 is expected, not a defect.
- All discovered internal links returned HTTP 200 except the deliberate unknown-route skip link, which correctly returned HTTP 404. External source and checkout links are explicitly marked external.
- The checkout endpoint returned its expected HTTP 303 hosted-checkout redirect without following it or starting a purchase. An invalid license response returned HTTP 200 with `valid: false` and `reason: "invalid"`.

## Privacy, accessibility, and deployment checks

- Normal live demo traffic was same-origin only. The visible privacy policy describes the optional Sociobot license verification and PeerJS connection setup.
- Live security headers include CSP with response-header `frame-ancestors 'none'`, HSTS, frame denial, MIME protection, strict-origin referrer policy, and microphone-only permissions policy.
- The live shell has a designed 404, route titles, canonical/social metadata, robots file, sitemap, legal pages, skip link, visible focus behavior, and reduced-motion support.
- The application respects reduced motion in both fresh viewports. Keyboard, dialog focus return, labelled controls, target sizing, semantic structure, and no-overflow checks are covered by the passing browser suite.

## Earlier findings disposition

All prior verification and review files were inspected: `.factory/verification.md`, `.factory/verification-2.md`, `.factory/review-1.md`, and `.factory/review-2.md`.

| Earlier finding set | Current disposition and evidence |
| --- | --- |
| Review 1 B1–B4 | Fixed: clear first screen, isolated direct-entry demo, claims registry with tests, and real designed HTTP 404. |
| Review 1 H1–H3 | Fixed: complete route metadata including static 404; Back/Forward scroll and focus test passes; consistent header/footer and complete desktop first screen pass. |
| Review 1 M1–M4 and L1 | Fixed: current copy audit records no over-length sentence or first-use jargon; terminology and result-naming links/controls are consistent; external source/checkout labeling remains explicit. |
| Review 1 U01–U45 | Closed: the later review's exact mapping was checked against current live and README copy. Claims were removed or rewritten where needed, and each remaining material promise is covered by the eleven separately passing registered claim tests. No unlisted public claim was found. |
| Verification 1 paid checkout and PWA defects | Fixed: checkout now returns HTTP 303; invalid-license recovery works; the explicit PWA update and cache MIME/offline tests pass. |
| Review 2 F-2-1–F-2-5 | Fixed: static 404 metadata, restored history position/focus, shell consistency/desktop facts, plain copy, and the daily license-verification claim all pass their dedicated browser checks. |

## Limits that are not findings

This container has no physical microphone, so the acoustic real-room capture path cannot be measured here. The deterministic microphone and sample tests exercise browser constraints, local processing, stop behavior, and recovery. No paid purchase was made; checkout reachability, price copy, entitlement controls, invalid-license recovery, and the hosted redirect were verified without a charge. These are documented test-environment limits, not untested public claims.
