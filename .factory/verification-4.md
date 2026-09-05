# Verification 4 — Turn room music into full-screen visuals

**Verdict: FAIL**

Verified 2026-09-05 UTC against implementation commit `4385e735d3e385bfaf922e2d2f799c531eb1c082` and live production at <https://milkdrop-web.sociobot.in>. The associated documentation commit is `28d844ce5806fb785c0aa39036908b11af6395bb`. The later `afffb4673cc2e46b47904b922b667803adf62fb5` commit changes only pre-existing Graphify output and was not treated as a new product image.

There is **one medium finding** and **zero untested public claims**. No product source was changed during this verification.

## Job, audience, and first action

Fresh reduced-motion Chromium contexts opened the live home page before scrolling. Milkdrop Web turns room music into full-screen visuals. It is for party hosts, musicians, and venues using a TV or projector. The first actions are **Listen to the room** for a real microphone and **Try it with sample data** for the one-click sandbox.

| Viewport | First screen result | Console errors |
| --- | --- | ---: |
| 390 × 844 phone | Headline, audience, both actions, next-step guidance, and all three facts end at 673 px. | 0 |
| 1440 × 900 desktop | The same content ends at 727 px. | 0 |

Screenshots: `/tmp/milkdrop-verify-4-live-phone.png` and `/tmp/milkdrop-verify-4-live-desktop.png`.

## Candidate and live identity

- Detached clean checkout: `/tmp/milkdrop-web-verify-4` at `4385e735d3e385bfaf922e2d2f799c531eb1c082`.
- `npm ci` passed: 97 packages installed and 0 vulnerabilities reported.
- `npm test` passed: 3/3 unit tests.
- `npm run build` passed and emitted `dist/`, `sw.js`, and `staticwebapp.config.json`.
- Initial app JavaScript is 39,179 bytes raw / 14,360 bytes gzip; CSS is 21,100 bytes raw / 5,470 bytes gzip.
- Local and live `index.html` SHA-256 both equal `23c855d04a53e40d5e2cf118d2c84392fca1f0cc813251a684a904a1b585c821`.
- Live `/`, `/demo`, `/privacy`, `/terms`, `/about`, `robots.txt`, `sitemap.xml`, manifest, worker, social image, and apple-touch icon return 200. A deliberately missing route returns the expected designed HTTP 404.
- Live hashed application JavaScript has `Cache-Control: public, max-age=31536000, immutable`. The live CSP, HSTS, frame denial, MIME protection, referrer policy, and microphone permissions policy are present as response headers.

## Declared claims

Every command named in `.factory/claims.json` was run separately from the detached checkout and passed. The demo, README, landing page, legal pages, and dialogs were cross-checked against that registry; remaining factual visitor promises map to these tests. There are no unlisted or untested public claims.

| Claim | Result |
| --- | --- |
| `demo-sample` | Pass: bundled 120 BPM sample renders, reaches 16 beats, rotates visual, and accepts a next-visual action. |
| `demo-isolation` | Pass: seeded real preset, preferences, and license sentinel values remain unchanged; demo traffic is same-origin. |
| `microphone-privacy` | Pass: microphone constraints disable AGC, echo cancellation, and noise suppression; no recorder, speech API, audio storage, upload, or unclosed test track. |
| `offline-reload` | Pass: a worker-controlled demo reloads offline and changes visual. |
| `visual-count` | Pass: eight free and four locked paid visual controls; selecting paid visual opens details. |
| `venue-pack` | Pass: sandbox entitlement enables local logo and 3840 × 2160 control; inactive entitlement remains locked. |
| `license-verification-cadence` | Pass: one verification inside 24 hours and a second at the 24-hour boundary. |
| `controls-access` | Pass: labelled touch and documented keyboard controls produce the specified visible state. |
| `phone-pairing` | Pass: paired second page changes the display; offline pairing fails clearly while the display stays active. |
| `art-provenance` | Pass: generator, date, source, and shipped-art locations are published. |
| `static-build` | Pass: static output, worker, Azure configuration, headers, and JS limit are present. |

`npm run test:browser` also passed all 25 tests (`test-results/artifacts/.last-run.json` reports `passed`). `npm run audit:pwa` passed its offline reload, asset MIME type, and app-only update simulation. With a preview server explicitly running, `npm run audit` passed mobile and desktop home plus demo, legal, art, and 404 routes with no axe violations, no overflow, one visible h1, and no console errors. `git diff --check` passed.

## Live product exercise

- In a fresh phone context, `/?demo=1` immediately opened the populated visualizer as **Fern echo** with title **Demo — Milkdrop Web** and persistent **Demo — sample data, nothing is saved** label plus **Reset demo** and **Start for real**.
- Next changed the visual to **Pollen orbit**. Reset restored **Fern echo**. The seeded real preset, preferences, and license values remained byte-for-byte unchanged. Starting for real removed the label and returned to `/`.
- A denied live microphone showed **The microphone stayed closed.** with a retry instruction and sample fallback.
- Offline worker-controlled demos at 320 px and 390 px kept the offline banner, demo banner, header, and stage controls in non-overlapping order. At 320 px their bounds were 0–88, 88–155, 155–215, and 219–326 px; at 390 px they were 0–88, 88–152, 152–212, and 216–323 px. No errors occurred.
- Live axe scans found no serious or critical violations on home (desktop), demo, privacy, terms, art, and the designed 404 (phone). Each had one visible h1 and one main landmark. The unavoidable browser console line for the deliberate HTTP 404 was excluded as expected transport feedback, not a page defect.
- Internal routes and the source link returned 200. The external hosted checkout link resolved successfully without beginning a purchase.
- The static product has no backend tenant, persistence process, health endpoint, or API rate-limit path of its own. Backend-only tenant/restart/429 checks are therefore not applicable.

## Finding

### F-4-1 — MEDIUM — documented browser audit command fails from the documented clean setup

`README.md` lists `npm run audit` under **Test and build**, but its script is only a browser client and does not start a preview server. From the detached clean checkout, after the documented `npm ci` and `npm run build`, this exact command fails:

```
page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/
```

It passes only after an undocumented separate command starts `npm run preview -- --host 127.0.0.1`. This makes the published verification instruction incomplete and prevents a consumer from running it from the documented clean setup.

Repair either the `audit` script so it starts and stops a built preview itself, or document the required preview-server step directly adjacent to the command. Then re-run the clean setup sequence. This finding alone requires the overall FAIL verdict; it does not make any declared visitor claim untested.

## Earlier finding disposition

All earlier review and verification reports were inspected.

| Earlier set | Current disposition |
| --- | --- |
| Review 1 B1–B4, H1–H3, M1–M4, L1, U01–U45 | Remain fixed: clear first screen, direct isolated demo, registered claim coverage, designed HTTP 404, route metadata/focus, consistent shell, copy audit, and explicit external links were observed or covered by current tests. |
| Verification 1 purchase, PWA cache/update, asset-cache, and security-header defects | Remain fixed: checkout resolves, `audit:pwa` passes offline/update/MIME tests, hashed assets are immutable, and live security headers are present. |
| Review 2 F-2-1 through F-2-5 | Remain fixed: 404 metadata, history focus/scroll, first-screen shell consistency, plain terminology, and license-verification cadence all pass current product/claim tests. |
| Verification 2 follow-up limits | No regression seen in the deterministic microphone, remote, privacy, accessibility, and payment-recovery coverage. Physical room acoustics and a paid charge remain environment limits, not untested claims. |
| Verification 3 PASS evidence | Reconfirmed except for the newly found README audit-command setup gap. |
| Review 3 F-3-1 and F-3-2 | Fixed: malformed saved data falls back to defaults and starts real mode with a microphone stub; live 320/390 px offline/demo notices do not overlap. |

## Verification limits

The container has no physical microphone, so acoustic performance in a real room was not measured; deterministic microphone and browser tests cover constraints, local processing, stop, invalid-state recovery, and permission recovery. No purchase was made. Lighthouse could not be independently launched in this container because its launcher could not connect to the supplied Chromium binary; this is a runner limitation, not an untested public claim. The built budget, live route/accessibility checks, and prior live Lighthouse evidence remain available in the preceding handoff.
