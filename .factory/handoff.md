# Milkdrop Web — repair 3 handoff

## Outcome

Implementation `4385e735d3e385bfaf922e2d2f799c531eb1c082` repairs both strict-review findings and is deployed at <https://milkdrop-web.sociobot.in>.

Milkdrop Web turns room music into full-screen visuals for party hosts, musicians, and venues using a TV or projector. The first action is **Listen to the room** for real microphone use, or **Try it with sample data** for the one-click sandbox.

- Invalid `milkdrop:preset` values now fall back to Fern echo. Malformed JSON, `null`, arrays, wrong types, invalid palettes, invalid booleans, and values outside the 20–100 control range now use safe defaults.
- Offline and demo notices now share a measured fixed stack. The header and stage controls use its measured height, so wrapped phone notices do not cover one another or the controls.
- Added outcome-based browser regression coverage for malformed, null, negative, wrong-type, and out-of-range saved state on direct home load and after **Start for real**. It starts the real visualizer with a microphone stub and asserts no page errors.
- Added 320 px and 390 px offline-demo checks that measure the visible offline notice, demo banner, header, and stage controls and require non-overlap.

## Verification

Detached clean checkout: `/tmp/milkdrop-web-repair-3-proof` at the implementation SHA.

- `npm ci`: passed; 97 packages installed, 0 vulnerabilities.
- `npm test`: passed, 3/3.
- `npm run build`: passed; emitted `dist/`, `sw.js`, and Azure configuration. Initial application JavaScript is 39.18 KB raw / 14.36 KB gzip. CSS is 21.10 KB raw / 5.47 KB gzip.
- All eleven commands in `.factory/claims.json` passed separately: `demo-sample`, `demo-isolation`, `microphone-privacy`, `offline-reload`, `visual-count`, `venue-pack`, `license-verification-cadence`, `controls-access`, `phone-pairing`, `art-provenance`, and `static-build`.
- `npm run test:browser`: passed, 25/25. This includes the new saved-settings recovery and 320 px/390 px notice-layout cases.
- `npm run audit:pwa`: passed offline reload, cached JavaScript/CSS MIME checks, and app-only update handling.
- `npm run audit` against a built preview: passed on mobile and desktop home plus demo, privacy, terms, about, and designed 404. Axe found no violations, there was no overflow, and the browser logged no errors.
- `git diff --check`: passed.

## Deployment and live checks

The durable static deployment command was run for the existing product app:

```sh
/opt/fleet/lib/deploy-static.sh milkdrop-web /work/repo/dist
```

The live and local `index.html` SHA-256 values both equal `23c855d04a53e40d5e2cf118d2c84392fca1f0cc813251a684a904a1b585c821`.

- `verify-url.sh` passed with HTTP 200, title, `lang=en`, one h1, a main landmark, complete image alt text, labelled buttons, and no load errors.
- Fresh 390 × 844 and 1440 × 900 reduced-motion contexts showed the job, audience, microphone and sample actions, next step, and all three facts before scrolling. On the phone the last fact ends at 673 px; on desktop it ends at 727 px.
- A fresh live sample began at Fern echo, changed to Pollen orbit, then Reset returned to Fern echo. Its persistent sample label remained visible. Seeded real preset, preference, and license values remained byte-for-byte unchanged.
- A live service-worker-controlled offline demo remained usable and changed visual. At 390 px the offline notice occupied 0–88 px, demo banner 88–152 px, header 152–212 px, and stage controls began at 216 px. There were no console errors.
- The live browser audit passed on home, demo, privacy, terms, about, and the deliberate HTTP 404. The 404 remains expected and designed, not a product defect.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.28 s, CLS 0, TBT 0 ms.

## Finding disposition

- F-3-1: fixed. Corrupt persisted values no longer prevent listeners or the real visualizer from starting.
- F-3-2: fixed. Phone notices stack at their measured heights instead of using a fixed one-line offset.
- Review 1 B1–B4, H1–H3, M1–M4, L1, and U01–U45 remain fixed by the existing clear first screen, isolated demo, claims registry, route metadata/history behavior, plain copy, labels, and designed 404.
- Review 2 F-2-1 through F-2-5 remain fixed: static 404 metadata, Back/Forward focus and scroll, standard shell/first-screen fit, plain terminology, and daily license verification coverage all passed current browser checks.
- Verification 1’s checkout, PWA update/offline, caching, and security-header findings remain fixed. The free core continues to work without any billing purchase.

## Evidence

- Live URL check: `/tmp/milkdrop-web-repair-3-live/`
- Live screenshots: `/tmp/milkdrop-web-repair-3-live-phone.png`, `/tmp/milkdrop-web-repair-3-live-desktop.png`, `/tmp/milkdrop-web-repair-3-live-demo-phone.png`, and `/tmp/milkdrop-web-repair-3-live-offline-phone.png`
- Live Lighthouse JSON: `/tmp/milkdrop-web-repair-3-lighthouse-live.json`
- Catalog description copy: `/work/.evidence/catalog-description.txt`

## Known limits

- This container has no physical microphone. Deterministic MediaStream and Web Audio stubs cover constraints, local processing, recovery, and track stop behavior. A venue should still do an acoustic room check before an event.
- Phone pairing depends on the disclosed PeerJS connection service and a network that permits WebRTC. Pairing failure leaves the local visualizer running.
- No paid purchase was made. Checkout reachability, returned-license handling, cached entitlement behavior, inactive-license recovery, and paid controls were verified without a charge.
- The pre-existing modified `graphify-out` files were not staged, committed, deployed, or changed.

The implementation SHA above differs from the later documentation commit that records this handoff; that documentation SHA is reported with the final work-order result.

---

# Verification 4 handoff

## Outcome

**FAIL** — implementation `4385e735d3e385bfaf922e2d2f799c531eb1c082` was independently checked against <https://milkdrop-web.sociobot.in>. Documentation commit: `28d844ce5806fb785c0aa39036908b11af6395bb`.

The live site matches the candidate `index.html` byte-for-byte. The product flow, demo isolation/reset, recovery states, responsive offline notices, accessibility, route design, PWA behaviour, and all eleven declared claims passed. One medium documentation/verification finding remains: `README.md` presents `npm run audit` as a test command, but it fails after the documented clean setup unless an undocumented `npm run preview -- --host 127.0.0.1` server is already running.

## How verified

- Detached clean checkout: `/tmp/milkdrop-web-verify-4` at the implementation commit.
- `npm ci`, `npm test`, and `npm run build` passed.
- All 11 `npm run test:claims -- --grep @claim:<id>` commands passed separately.
- `npm run test:browser` passed 25/25.
- `npm run audit:pwa` passed.
- `npm run audit` passes when a built preview is explicitly running; it is the outstanding documentation gap when invoked exactly as listed in README.
- Live 390 × 844 and 1440 × 900 cold-page checks showed the job, audience, actions, guidance, and facts before scrolling. Live demo reset/data isolation, denied-microphone recovery, 320/390 px offline layout, routes, link reachability, and Axe scans passed.

## Required follow-up

Fix or document the preview-server prerequisite for `npm run audit`, then repeat the documented clean setup sequence and update the verification verdict.

## Limits

No physical microphone or paid purchase was available. Deterministic browser coverage exercised those code paths without treating either environment limit as an untested public claim. Lighthouse could not launch against the supplied Chromium binary in this container; see `.factory/verification-4.md` for the exact scope.
