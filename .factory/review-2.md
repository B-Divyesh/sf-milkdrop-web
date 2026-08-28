# Adversarial first-read review 2 — Milkdrop Web

Reviewed 28 August 2026 UTC against commit `83024c6058860ff675e18e97eb46a72f9339c8b9` and <https://milkdrop-web.sociobot.in>.

## Verdict: FAIL

The core product and demo work, and all ten declared claim tests pass. The review still has five findings. Four are blocking because earlier findings are only partly fixed, and the review instructions require any such finding to block again.

## Cold first read

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900 before scrolling. Screenshots are `/tmp/milkdrop-review-2-mobile.png` and `/tmp/milkdrop-review-2-desktop.png`.

- What it does: turns music heard through the room microphone into full-screen visuals.
- For whom: party hosts, musicians, and venues using a TV or projector.
- What to click first: **Listen to the room** for real use, or **Try it with sample data** to evaluate it without permission.

All three answers are clear from both initial viewports, so there is no first-read blocking finding. The exact copy is **“Turn room music into full-screen visuals.”**, **“For party hosts, musicians, and venues using a TV or projector.”**, **“Listen to the room”**, and **“Try it with sample data.”**

The desktop layout nevertheless pushes the full next-step explanation and all three plain facts below the 900 px fold. That structural regression is recorded in F-2-3.

## Findings

### F-2-1 / prior H1 — BLOCKING — the 404 route still has incomplete metadata

- Exact location: live unknown route `/definitely-missing-review-2`; source `public/404.html`.
- Evidence: the route correctly returns HTTP 404 with title **“Page not found — Milkdrop Web”**, one h1, a description, canonical, and SVG favicon. It has no Open Graph title/image, Twitter card, or apple-touch icon. The SPA routes have all of these.
- Why this remains open: prior H1 required complete route metadata. Repairing only the SPA shell leaves the designed 404 as a second, incomplete document.
- Concrete fix: add the same product-specific OG image, Open Graph/Twitter tags, and apple-touch icon to `public/404.html`. Add a browser assertion for metadata on a server-returned unknown route.

### F-2-2 / prior H2 — BLOCKING — Back restores the page but loses the visitor's place

- Exact location: History API handling in `src/main.ts`, especially `history.scrollRestoration = 'manual'`, `popstate`, and `focusRouteHeading()`.
- Evidence: on the live 390 px page, scrolling to the footer recorded `scrollY = 2077`. After opening Privacy through the SPA and pressing Back, the home h1 received focus but the page returned to `scrollY = 44`, not the prior location.
- Why this remains open: focus and announcements were repaired, but the earlier H2 also required back/forward navigation to restore scroll and focus. A visitor reading near the bottom loses their place.
- Concrete fix: save scroll coordinates and the focused element in each history entry before navigation. On `popstate`, render without scrolling the h1, restore the saved scroll position and focus, and announce the route. Add a test that navigates from a scrolled home section and verifies both values after Back and Forward.

### F-2-3 / prior H3 — BLOCKING — the standard shell and first-screen facts are still inconsistent

- Exact locations: live `/demo`, the static 404 response, and the 1440 × 900 home viewport.
- Evidence: `/demo` has zero visible headers and zero visible footers because the running stage hides both. The 404 has a reduced header and no footer. At 1440 × 900, **“Your browser will ask for microphone access…”** is clipped at the bottom and the three facts beginning **“Uses the room microphone; no audio routing.”** are entirely below the fold.
- Why this remains open: prior H3 required a consistent header/footer and the prescribed first-screen structure. The landing sections were added, but these route and viewport cases remain half-fixed.
- Concrete fix: keep a compact branded header and footer available on the demo route without covering controls; give the 404 the same Privacy/Terms footer and standard navigation; reduce the desktop hero height/type scale so the complete next-step line and all three facts fit at 1440 × 900. Add viewport-bound assertions for the facts and shell assertions on every route.

### F-2-4 / prior M2 — BLOCKING — avoidable jargon remains in first-use and README copy

- Exact quotes: **“Uses the room microphone; no audio routing.”** on the first screen; **“Eight free WebGL visuals…”**, **“An offline app shell…”**, and **“The production command emits a static `dist/` root.”** in README.
- Why this remains open: “audio routing,” “WebGL,” “app shell,” and “dist root” require audio or web-development context. Prior M2 was a plain-language finding, so leaving these terms in user-facing copy is a partial fix.
- Concrete rewrites:
  - **“It listens through your device microphone; you do not connect the music source.”**
  - **“Eight free visuals and four Venue Pack visuals.”**
  - **“The demo and visualizer work offline after your first visit.”**
  - **“The build writes a deployable static site to `dist/`.”**

### F-2-5 — HIGH — a quantitative privacy claim is absent from the claims registry

- Exact quote/location: `/privacy`, **“Milkdrop Web sends a license key to Sociobot for verification at most once each day.”**
- Why this matters: “at most once each day” is a precise network-frequency promise that a purchaser can rely on. No `.factory/claims.json` entry names it, and no tagged test advances time and verifies the request limit.
- Concrete fix: add a `license-verification-cadence` claim and a clean-browser test that seeds a license, controls the clock, and proves one verification request per 24-hour window. Alternatively, remove the frequency promise and state only when verification occurs.

## Demo and sandbox

The required demo behavior passes.

- The first screen contains **Try it with sample data**. One click opens `/?demo=1`.
- The first demo frame is the running product, not instructions: **Sample track · 120 BPM**, **Fern echo**, an animated WebGL canvas, visual controls, and beat status are already present.
- The persistent banner says **“Demo — sample data, nothing is saved”** and contains **Reset demo** and **Start for real**.
- Changing the visual and palette, then choosing Reset, restored **Fern echo** and the lichen palette.
- Start for real discarded the demo and returned to `/`.
- A direct clean demo with seeded real values kept `milkdrop:preset`, `milkdrop:preferences`, and `sb_license:milkdrop-web` byte-for-byte unchanged. It started with demo defaults rather than the seeded real choices.
- The live demo request log contained only `https://milkdrop-web.sociobot.in`. An offline reload remained usable and changed from Fern echo to Pollen orbit.
- `.factory/demo.md` documents both entry points, sample behavior, reset, and in-memory isolation.

## Claims verification

Clean clone: `/tmp/milkdrop-review-2-clean-udPDic` at `83024c6058860ff675e18e97eb46a72f9339c8b9`.

Every command was run separately, exactly as listed in `.factory/claims.json`.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `demo-sample` | Pass | 120 BPM sample rendered frames and changed visual after 16 beats. |
| `demo-isolation` | Pass | Seeded real keys were unchanged; direct demo requests were same-origin only. |
| `microphone-privacy` | Pass | Stubbed stream used stated constraints; no recording, speech API, storage, or cross-origin request; tracks closed. |
| `offline-reload` | Pass | Service-worker-controlled demo reloaded offline and remained operable. |
| `visual-count` | Pass | Eight free and four locked controls; the ninth opened Venue Pack details. |
| `venue-pack` | Pass | Cached sandbox license exposed logo/4K controls; inactive verdict relocked them; price and checkout target matched. |
| `controls-access` | Pass | Touch and keyboard interactions changed their stated visible states and restored focus. |
| `phone-pairing` | Pass | A second page controlled the display; blocked networking produced the recovery message without stopping visuals. |
| `art-provenance` | Pass | Generator, date, source, and shipped asset locations were present. |
| `static-build` | Pass | Static root, service worker, Azure config, headers, and JS limit passed. |

No declared claim test failed. F-2-5 is an unlisted, therefore untested, claim.

Additional clean-clone results:

- `npm ci`: pass; 0 vulnerabilities.
- `npm test`: pass; 3/3.
- `npm run build`: pass; `dist/` generated; initial JS 36.34 KB raw / 13.43 KB gzip.
- `npm run test:browser`: pass; 19/19.
- `npm run audit:pwa`: pass; offline reload, cached MIME types, and explicit update flow.
- Live axe audit: zero violations on mobile/desktop home, demo, privacy, terms, about, and unknown-route documents.
- Live console: no errors on normal home or demo. Chromium reports the expected failed-document 404 when the audit intentionally opens an unknown URL.

## Copy audit

Counting treats hyphenated compounds and paths as one word. No sentence exceeds 22 words. No banned marketing adjective appears. F-2-4 records the remaining jargon.

### Landing page sentences

| ID | Exact sentence | Words | Audit |
| --- | --- | ---: | --- |
| L01 | Turn room music into full-screen botanical visuals for TVs and projectors. | 11 | Covered by `demo-sample`. |
| L02 | Try the sample without microphone access. | 6 | Covered by `demo-sample`. |
| L03 | You’re offline. | 2 | Clear. |
| L04 | The demo and visualizer still work. | 6 | Covered by `offline-reload`. |
| L05 | Phone pairing and license checks need internet. | 7 | Covered by `phone-pairing`. |
| L06 | An update is ready. | 4 | Clear. |
| L07 | Turn room music into full-screen visuals. | 6 | Clear headline. |
| L08 | For party hosts, musicians, and venues using a TV or projector. | 11 | Clear audience. |
| L09 | Your browser will ask for microphone access, then open the visualizer. | 11 | Clear; clipped at desktop fold in F-2-3. |
| L10 | The sample opens without permission. | 5 | Covered by `demo-sample`. |
| L11 | Uses the room microphone; no audio routing. | 7 | Jargon; F-2-4. |
| L12 | Microphone audio stays on this device. | 6 | Covered by `microphone-privacy`. |
| L13 | Eight visuals are free; Venue Pack adds four. | 8 | Covered by `visual-count`. |
| L14 | The microphone stayed closed. | 4 | Clear error. |
| L15 | Allow microphone access in this site’s settings, then try again. | 10 | Clear recovery. |
| L16 | A pressed fern opens into sound waves and gold pollen on a dark botanical plate. | 15 | Clear image purpose. |
| L17 | See the visualizer before opening your microphone. | 7 | Clear. |
| L18 | The sample uses a bundled 120 BPM signal. | 8 | Covered by `demo-sample`. |
| L19 | Change the visual, colors, and motion while it runs. | 9 | Covered by `controls-access`. |
| L20 | Allow the room microphone. | 4 | Clear. |
| L21 | Volume and pitch ranges move the visual. | 7 | Covered by `demo-sample`. |
| L22 | Choose one, or switch about every 16 beats. | 8 | Covered by `demo-sample`. |
| L23 | It does not identify songs, understand speech, record audio, or upload microphone audio. | 13 | Covered by `microphone-privacy`. |
| L24 | It only measures sound ranges in browser memory. | 8 | Covered by `microphone-privacy`. |
| L25 | Add four venue visuals and 4K controls. | 7 | Covered by `venue-pack`. |
| L26 | A one-time $19 USD license adds four visuals, a local logo overlay, and a 4K canvas control. | 17 | Covered by `venue-pack`. |
| L27 | The eight free visuals stay available. | 6 | Covered by `visual-count`. |
| L28 | Raise the canvas limit to 3840 × 2160. | 7 | Covered by `venue-pack`. |
| L29 | Scan the code to pair your phone. | 7 | Covered by `phone-pairing`. |
| L30 | It sends visual and color controls to this screen. | 9 | Covered by `phone-pairing`. |
| L31 | Preparing the phone connection… | 4 | Clear state. |
| L32 | PeerJS introduces the two browsers. | 5 | Necessary disclosure; technical term explained by context. |
| L33 | They then send controls through WebRTC. | 6 | Necessary disclosure; covered by `phone-pairing`. |
| L34 | If pairing fails, the local visualizer keeps running. | 8 | Covered by `phone-pairing`. |
| L35 | This is a one-time purchase. | 5 | Covered by `venue-pack`. |
| L36 | Sociobot/Dodo is the merchant of record and handles eligible refunds. | 11 | Covered by `venue-pack`. |
| L37 | The eight free visuals stay available. | 6 | Covered by `visual-count`. |
| L38 | Turn room music into full-screen visuals. | 6 | Footer repeat; clear. |

### Landing headings and actions

All interactive labels use result-oriented verbs: **Try demo** (2), **Listen to the room** (4), **Try it with sample data** (5), **Update now** (2), **Reset demo** (2), **Start for real** (3), **Try the microphone again** (4), **Try sample data instead** (4), **Open the sample visualizer** (4), **Read the privacy details** (4), **See Venue Pack details** (4), **Tune visuals** (2), **Show controls** (2), **Stop listening** (2), **Apply tuning** (2), **Pair a phone** (3), **Enter full screen** (3), **Hide controls** (2), **Copy phone link** (3), **Buy Venue Pack — $19** (4), and **Restore purchase** (2).

The functional headings make sense out of context: **Turn room music into full-screen visuals** (6), **See the visualizer before opening your microphone** (7), **How it works** (3), **What it does not do** (5), **Add four venue visuals and 4K controls** (7), **Sample music visualizer** (3), **Tune visuals** (2), and **Pair a phone** (3). Botanical names and field labels are decorative and are not used as instructions.

### README sentences and list items

| ID | Exact copy | Words | Audit |
| --- | --- | ---: | --- |
| R01 | Turn room music into full-screen botanical visuals for TVs and projectors. | 11 | Clear. |
| R02 | Milkdrop Web is for party hosts, musicians, rehearsal rooms, and venues. | 11 | Clear. |
| R03 | Open the site and allow its microphone. | 7 | Clear. |
| R04 | No audio routing is needed. | 5 | Jargon; F-2-4. |
| R05 | Try it with sample data. | 5 | Clear link action. |
| R06 | The demo starts a bundled 120 BPM signal without asking for microphone access. | 13 | Covered by `demo-sample`. |
| R07 | Eight free WebGL visuals and four Venue Pack visuals | 9 | Jargon; F-2-4. |
| R08 | Visual choice, four color palettes, motion tuning, and microphone sensitivity | 10 | Clear feature fragment. |
| R09 | Labelled touch controls and keyboard controls | 6 | Covered by `controls-access`. |
| R10 | Full-screen mode and optional phone pairing | 6 | Covered by `controls-access` and `phone-pairing`. |
| R11 | An offline app shell that keeps the demo and visualizer available after the first visit | 15 | Jargon; F-2-4. |
| R12 | A one-time $19 USD Venue Pack with four visuals, a session-only logo overlay, and a 3840 × 2160 canvas control | 19 | Covered by `venue-pack`. |
| R13 | Microphone audio is analyzed in browser memory. | 7 | Covered by `microphone-privacy`. |
| R14 | It is not recorded, transcribed, stored, or uploaded. | 8 | Covered by `microphone-privacy`. |
| R15 | The app includes no trackers. | 5 | Covered by the same-origin request portion of `microphone-privacy`. |
| R16 | Phone pairing displays a room code. | 6 | Covered by `phone-pairing`. |
| R17 | A failed connection leaves the local visualizer running and explains that pairing needs internet access. | 15 | Covered by `phone-pairing`. |
| R18 | Open `/?demo=1` or `/demo`. | 4 | Clear. |
| R19 | Sample settings stay in memory. | 5 | Covered by `demo-isolation`. |
| R20 | The demo does not read or change real preferences or license data. | 12 | Covered by `demo-isolation`. |
| R21 | Use Reset demo for a fresh sample. | 7 | Clear. |
| R22 | Use Start for real to discard the sample and return home. | 11 | Clear. |
| R23 | See `.factory/demo.md` for the verification contract. | 6 | Clear developer link. |
| R24 | Use a current LTS release of Node.js. | 7 | Clear prerequisite. |
| R25 | Every public product promise is listed in `.factory/claims.json`. | 8 | Contradicted by F-2-5. |
| R26 | Each entry names one tagged browser test. | 7 | Confirmed. |
| R27 | The production command emits a static `dist/` root. | 8 | Jargon; F-2-4. |
| R28 | It includes `index.html`, the service worker, and Azure routing with security headers. | 12 | Appropriate in build documentation. |
| R29 | Initial JavaScript stays below 200 KB. | 6 | Covered by `static-build`. |
| R30 | Deploy the contents of `dist/` as an Azure Static Web App. | 11 | Clear deployment instruction. |
| R31 | The repository does not manage DNS, billing, or infrastructure. | 9 | Scope statement, not a product outcome. |
| R32 | Left and right arrows: choose the previous or next visual. | 10 | Covered by `controls-access`. |
| R33 | F: enter or leave full screen. | 6 | Covered by `controls-access`. |
| R34 | H: hide or show controls. | 5 | Covered by `controls-access`. |
| R35 | C: open visual settings. | 4 | Covered by `controls-access`. |
| R36 | R: open phone pairing. | 4 | Covered by `controls-access`. |
| R37 | Space: stop the visualizer and return to setup. | 8 | Covered by `controls-access`. |
| R38 | Read the in-product privacy policy and terms. | 7 | Clear link action. |
| R39 | Checkout uses only the Sociobot billing API. | 7 | Covered by `venue-pack`. |
| R40 | See `.factory/brief.json` for scope. | 4 | Clear developer link. |
| R41 | See `.factory/design.md` for visual decisions and asset provenance. | 8 | Clear developer link. |
| R42 | See `.factory/handoff.md` for release evidence. | 5 | Clear developer link. |
| R43 | MIT. | 1 | Clear. |
| R44 | See LICENSE. | 2 | Clear link action. |

README headings are **Milkdrop Web** (2), **Included features** (2), **Demo sandbox** (2), **Run locally** (2), **Test and build** (3), **Controls** (1), **Privacy and purchases** (3), **Project records** (2), and **License** (1). Each identifies its section without surrounding context.

## Earlier-review verification

No `.factory/polish-*.md` file exists. `.factory/review-1.md` and the prior `.factory/handoff.md` were read in full. The handoff statement that every earlier finding was resolved is not confirmed because H1, H2, H3, and M2 remain partial.

| Earlier id | Status in live site and code |
| --- | --- |
| B1 | Fixed: job, audience, and actions are explicit at both viewports. |
| B2 | Fixed: one-click demo, banner, reset/exit, in-memory state, and direct-entry isolation all pass. |
| B3 | Fixed: claims registry exists and every declared command passes. |
| B4 | Fixed: unknown paths return the designed HTTP 404. |
| H1 | **Half-fixed; reissued as F-2-1.** SPA metadata is complete, but the 404 document omits required social/touch metadata. |
| H2 | **Half-fixed; reissued as F-2-2.** Route focus and announcements work, but Back/Forward scroll restoration does not. |
| H3 | **Half-fixed; reissued as F-2-3.** Landing sections exist, but demo/404 shells differ and desktop first-screen facts fall below the fold. |
| M1 | Fixed: no landing or README sentence exceeds 22 words. |
| M2 | **Half-fixed; reissued as F-2-4.** Most functional metaphors were removed, but avoidable jargon remains. |
| M3 | Fixed: microphone, visual, full screen, Venue Pack, phone remote, and color palette are used consistently. |
| M4 | Fixed: former noun-only header buttons are now action links or result-naming controls. |
| L1 | Fixed: Source says “external” and checkout says “external checkout.” |

Every earlier unlisted-claim item was checked separately:

| Earlier id | Current result |
| --- | --- |
| U01 | Rewritten and covered by `demo-sample`. |
| U02 | Covered by `microphone-privacy`. |
| U03 | Rewritten and covered by `offline-reload`. |
| U04 | Covered by `microphone-privacy`. |
| U05 | Rewritten and covered by `controls-access`. |
| U06 | Rewritten and covered by `demo-sample`. |
| U07 | Rewritten and covered by `microphone-privacy`. |
| U08 | Rewritten and covered by `microphone-privacy`. |
| U09 | Removed from functional copy; no-speech behavior is checked by `microphone-privacy`. |
| U10 | Rewritten and covered by `demo-sample`. |
| U11 | Rewritten and covered by `demo-sample`, `visual-count`, and `art-provenance`. |
| U12 | Rewritten and covered by `phone-pairing` and `microphone-privacy`. |
| U13 | Rewritten and covered by `phone-pairing`. |
| U14 | Rewritten and covered by `phone-pairing`. |
| U15 | Rewritten and covered by `visual-count`. |
| U16 | Rewritten and covered by `venue-pack`. |
| U17 | Quantified and covered by `venue-pack`. |
| U18 | Rewritten and covered by `visual-count`. |
| U19 | Rewritten and covered by `visual-count` and `art-provenance`. |
| U20 | Removed from README; deterministic analysis remains unit-tested. |
| U21 | Rewritten and covered by `phone-pairing`. |
| U22 | Rewritten and covered by `controls-access`. |
| U23 | Rewritten and covered by `venue-pack`. |
| U24 | Split into `offline-reload`, `microphone-privacy`, and `static-build`. |
| U25 | Covered by `microphone-privacy`. |
| U26 | Rewritten and covered by `microphone-privacy`. |
| U27 | Removed from README; the dialog disclosure is covered by `phone-pairing`. |
| U28 | Removed from public copy. |
| U29 | Rewritten and covered by `phone-pairing`. |
| U30 | Rewritten and covered by `static-build`. |
| U31 | Rewritten and covered by `controls-access`. |
| U32 | Removed from README; the live error state supplies retry and sample actions. |
| U33 | Removed from README; microphone constraints are checked by `microphone-privacy`. |
| U34 | Removed from README; renderer and bundle behavior are covered by `demo-sample` and `static-build`. |
| U35 | Removed from public copy. |
| U36 | Rewritten and covered by `demo-sample`. |
| U37 | Rewritten and covered by `microphone-privacy` and `controls-access`. |
| U38 | Rewritten and covered by `phone-pairing`. |
| U39 | Rewritten and covered by `venue-pack`. |
| U40 | The unsupported exact Node 20 claim was removed. |
| U41 | Covered by `static-build`. |
| U42 | Rewritten and covered by `static-build`. |
| U43 | Rewritten and covered by `controls-access`. |
| U44 | Quantified and covered by `static-build`. |
| U45 | Rewritten and covered by `art-provenance`. |

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Titles | Pass on home, demo, privacy, terms, about, and 404; all follow the required pattern and are under 60 characters. |
| One h1 / main / language | Pass on all checked routes. |
| Description/canonical | Pass on all checked routes. |
| OG/Twitter/apple icon | Pass on SPA routes; fail on static 404, F-2-1. |
| Designed 404 | Pass: true HTTP 404, product styling, plain explanation, Return home, and Try demo. |
| Deep links | Pass for `/demo`, `/privacy`, `/terms`, and `/about`. |
| Route focus/live announcement | Pass. |
| Back/Forward scroll | Fail, F-2-2. |
| Link crawl | Pass: every product link returned 200; GitHub returned 200; checkout resolved to hosted Dodo checkout; unknown-route self-link remained the expected 404 document. |
| Header/footer | Pass on normal SPA pages; fail on demo and 404, F-2-3. |
| Mobile overflow/touch targets | Pass at 390 px. |
| Axe serious/critical issues | None on all checked routes. |
| Reduced motion | Pass in browser suite and code review. |
| Visual identity | Pass: the nocturnal herbarium sheet, botanical artwork, paper/forest palette, type pairing, and living-specimen canvas are distinct from a generic SaaS template. |

## Missed leverage

No missing AI, import/export, or sync feature is warranted. The brief is explicitly a microphone-driven visualizer with no audio routing. AI would add network and privacy cost without improving the core job, while audio import would contradict the stated product boundary.

## What would make this perfect

Resolve F-2-1 through F-2-5, add regression tests for 404 metadata, history scroll/focus restoration, shell consistency, and desktop first-screen visibility, then rerun every declared claim command and the full live crawl. A perfect next review has no carried finding, no jargon flag, and no public sentence outside the claims registry.
