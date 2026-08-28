# Adversarial first-read review 1 — Milkdrop Web

Reviewed 2026-08-28 UTC against commit `7650ddcc2beae9df49ca74753ea6d7e672e698ca` and <https://milkdrop-web.sociobot.in>.

## Verdict: FAIL

There are four blocking findings: the first screen does not identify its audience, the required one-click sandboxed demo is absent, the claims registry is absent, and unknown routes do not render a designed 404. There are more than three additional findings.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before scrolling. Screenshots are at `/tmp/milkdrop-review-mobile.png` and `/tmp/milkdrop-review-desktop.png` in the review container.

- What it appears to do: listen through the room microphone and turn playing music into full-screen, beat-reactive botanical visuals.
- For whom: **cannot determine from either first screen**. Parties, bars, rehearsal rooms, TVs, and projectors appear only in the README, not in the viewport.
- What to click first: **“Listen to the room.”** This is identifiable as the primary action.

### BLOCKING B1 — the first screen does not say who this is for

- Quote: **“Sound grows here.”** / **“Watch whatever is playing in the room become a living, beat-aware specimen.”**
- Why this loses a first-time visitor: the metaphor does not identify a party host, musician, bar, venue, TV, or projector. “Specimen” also makes the output less concrete. The visitor can infer microphone use, but cannot answer all three mandatory questions.
- Concrete fix: use **“Turn room music into full-screen visuals”** as the h1, followed by **“For party hosts, musicians, and venues using a TV or projector.”** Keep **“Listen to the room”** and add **“Your browser will ask for microphone access, then open the visualizer.”**

### BLOCKING B2 — there is no one-click, isolated demo

- Quote/evidence: no visible **“Try it with sample data”** action exists (`0` exact matches). The only preview action is **“Preview without a mic,”** hidden until microphone permission fails. Visiting `/demo` returns the normal landing page with **“Sound grows here,”** not a running sample.
- Why this loses or misleads a visitor: a visitor cannot see the product work without first attempting or denying microphone access. There is no persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, or **Start for real** action.
- Sandbox failure: the hidden preview writes `milkdrop:preferences` immediately and `milkdrop:preset` after changing a scene. These are the same `milkdrop:*` localStorage keys used by real mode, not a `demo:*` namespace. Real preferences can therefore be read or overwritten during preview. `.factory/demo.md` is also absent.
- Concrete fix: make **“Try it with sample data”** visible beside the real microphone action and make `/demo` enter a realistic sample signal immediately. Use an in-memory or `demo:*` store; display the required banner; implement Reset and Start for real; discard demo state on exit; document it in `.factory/demo.md`.

Exploratory evidence: once the hidden preview was forced open, the stage did show “Preview signal” and “Fern echo,” and Next changed it to “Pollen orbit.” Requests during this flow were same-origin only. An offline reload also restored the shell. Those behaviors do not remedy the missing entry point or shared storage.

### BLOCKING B3 — claims cannot be verified

- Quote/evidence: `.factory/claims.json` does not exist in the repository or clean clone.
- Why this misleads a visitor: the landing page and README make privacy, offline, remote, rendering, feature-count, and accessibility claims without any declared claim tests. A passing general unit suite cannot show which public promises were exercised.
- Concrete fix: create `.factory/claims.json`; give every material claim below exactly one `@claim:<id>` test; run each from `/demo` in a clean browser; remove any claim that cannot be observed in that sandbox.

Clean-clone result at `/tmp/milkdrop-web-review-1-clean`:

| Check | Result |
| --- | --- |
| Commit | `7650ddcc2beae9df49ca74753ea6d7e672e698ca` |
| `.factory/claims.json` | Missing; no listed claim commands could be run |
| `npm ci` | Pass; 0 vulnerabilities |
| `npm test` | Pass; 3/3 audio-analysis unit tests |
| `npm run build` | Pass; `dist/` generated |

Every row below is an unlisted-claim finding. The quote has no claims entry, a visitor could rely on it, and the stated test is the concrete fix.

| ID | Exact claim quote and location | Why it needs proof | Required claim test or rewrite |
| --- | --- | --- | --- |
| U01 | “Turn the music already playing in your room into beat-aware, full-screen botanical visuals.” — meta description | Promises the core transformation. | From `/demo`, assert a sample signal changes visible render metrics and fullscreen can be requested; otherwise simplify the claim. |
| U02 | “Audio never leaves your device.” — meta description | Privacy promise. | Intercept the complete demo and microphone-stub flows and assert no audio payload or undisclosed origin request. |
| U03 | “The visualizer still works; remote pairing and license checks will wait.” — offline banner | Offline behavior promise. | Load `/demo`, install the worker, go offline, reload, and operate the visualizer; separately assert deferred remote/license states. |
| U04 | “Open the mic.” — landing hero | Promises microphone capture. | Stub a successful microphone stream and assert the live stage receives analyser frames. |
| U05 | “Fill the screen.” — landing hero | Promises fullscreen operation. | Exercise the Fullscreen API from the product action and assert the stage becomes the fullscreen element. |
| U06 | “Watch whatever is playing in the room become a living, beat-aware specimen.” — landing hero | Promises beat-reactive output for room audio. | Feed deterministic sample audio and assert beat events alter the rendered scene. |
| U07 | “Processed only on this device.” — landing hero | Privacy promise. | Run network interception for the entire microphone/demo flow and assert only disclosed non-audio requests. |
| U08 | “Never recorded.” — landing hero | Privacy promise. | Assert the flow creates no `MediaRecorder`, upload, audio blob, IndexedDB/OPFS record, or audio storage entry. |
| U09 | “The room mic hears dynamics, not words.” — landing fact | Promises no speech/content interpretation. | Assert the audio path uses amplitude/frequency analysis only and invokes no speech-recognition/transcription API. |
| U10 | “Onsets and tempo shape every scene.” — landing fact | Promises analysis affects every visual preset. | Feed fixed onset/tempo frames through all available presets and assert observable parameter changes. |
| U11 | “Twelve original specimens rotate with the phrase.” — landing fact | Promises count, originality, and phrase rotation. | Test 12 distinct preset definitions and a rotation after the declared phrase event; change “original” to provenance wording if it cannot be tested. |
| U12 | “Your phone sends preset and colour controls directly to this screen; microphone audio never leaves it.” — remote dialog | Promises remote controls and an audio boundary. | Pair two clean pages, exercise preset/colour controls, and intercept both pages to confirm no audio transfer. |
| U13 | “Control messages then travel peer to peer.” — remote dialog | Describes network behavior. | Inspect the established WebRTC data channel and assert commands arrive without an application relay. |
| U14 | “If a network blocks WebRTC, the visualizer keeps working normally.” — remote dialog | Promises graceful failure. | Block signalling/WebRTC, assert the error state, then operate the local visualizer. |
| U15 | “Four rare specimens, for twelve total.” — Venue Pack | Paid entitlement claim. | Apply a sandbox license and assert four additional presets and 12 total; replace “rare” with a factual label. |
| U16 | “Local logo overlay — the image stays on this device.” — Venue Pack | Paid feature and privacy promise. | Add a sample logo, assert it renders, and assert no file or blob request leaves the origin. |
| U17 | “Sharper 4K rendering controls.” — Venue Pack | Unquantified quality claim. | Assert the paid control raises the backing buffer to a documented 4K limit, or rewrite as “4K canvas size control.” |
| U18 | “The eight free specimens remain yours to use.” — Venue Pack | Availability/entitlement promise. | In a clean unlicensed context, assert eight presets remain selectable before and after failed checkout/restore. |
| U19 | “Twelve original WebGL botanical specimens: eight free and four in the Venue Pack” — README | Count, technology, provenance, and entitlement claim. | Test counts and WebGL renderer use; link provenance rather than treating “original” as an untested adjective. |
| U20 | “Local FFT, adaptive onset detection, tempo estimate, downbeat emphasis, and 16-beat phrase rotation” — README | Detailed analysis claims. | Add deterministic fixtures asserting FFT-derived bands, onset, tempo, downbeat, and rotation at 16 beats. |
| U21 | “Phone remote over an encrypted WebRTC data channel, paired by QR or room link” — README | Security and pairing claim. | Pair by both advertised paths and assert a DTLS-secured data channel. |
| U22 | “Four palettes, motion and microphone tuning, keyboard operation, and full-screen mode” — README | Feature bundle claim. | Exercise all four palettes, both tuners, documented keyboard controls, and fullscreen in `/demo`. |
| U23 | “Optional one-time $19 Venue Pack with rare specimens, a local-only logo overlay, and 4K tuning” — README | Price and paid-feature claim. | Assert checkout price/one-time terms and sandbox entitlements; replace “rare” with the exact count. |
| U24 | “Installable/offline-capable app shell with no tracking or third-party runtime assets” — README | Offline, install, privacy, and asset-origin claim. | Test manifest/installability, offline demo reload, no tracker requests, and same-origin runtime assets. |
| U25 | “Microphone audio is analysed only in browser memory.” — README | Privacy/storage claim. | Assert no audio persistence and no audio-bearing network request across the full flow. |
| U26 | “It is never recorded or uploaded.” — README | Privacy claim. | Use the U08 privacy test and list both landing and README in `where`. |
| U27 | “The optional remote uses PeerJS’s public signalling service for connection setup; only control messages are sent.” — README | Third-party/network boundary claim. | Intercept pairing and assert PeerJS signalling plus control-only data-channel payloads. |
| U28 | “Microphone access requires `localhost` or HTTPS.” — README | Compatibility requirement. | Test denial on an insecure non-local origin or link the browser platform rule as a documented prerequisite. |
| U29 | “To use the phone remote, both browsers need internet access for signalling and a network that permits WebRTC.” — README | Remote prerequisites. | Block each prerequisite separately and assert the stated error and unaffected local visualizer. |
| U30 | “It writes a static site to `dist/`, with `dist/index.html` at the deploy root.” — README | Build output claim. | Add a build smoke test asserting both paths after `npm run build`. |
| U31 | “On touch screens, all functions are available through labelled controls.” — README | Mobile/accessibility claim. | At 390 px, exercise every keyboard-listed function via a named touch target. |
| U32 | “If microphone access fails, the launch sheet explains how to retry and offers a no-mic preview.” — README | Error-recovery claim. | Deny permission and assert the explanation, retry, and preview outcomes. |
| U33 | “Web Audio provides raw frequency data with AGC, echo cancellation, and noise suppression explicitly disabled.” — README | Audio-constraint claim. | Stub `getUserMedia` and assert all three constraints are false and analyser data is consumed. |
| U34 | “The renderer is a compact original WebGL fragment shader; dependencies for QR generation and WebRTC load only when remote pairing opens.” — README | Technology, provenance, size, and lazy-load claim. | Define “compact” numerically, assert WebGL use and bundle threshold, and assert remote chunks are absent before pairing. |
| U35 | “Preferences and license state are local-first.” — README | Storage/network behavior claim. | Define “local-first”; assert preference writes stay local and document/verify the license-check exception. |
| U36 | “Mic-driven, beat-aware visuals for parties, jam rooms, bars, TVs, and projectors.” — README | Core capability and supported-situation claim. | Feed the sample signal at mobile and projector viewports and assert beat-reactive output; rewrite the device list if it is only audience copy. |
| U37 | “Open the site, let the browser listen to the room, and run a full-screen visual instrument without routing Spotify, a mixer, or an audio file into it.” — README | Promises the complete no-routing workflow. | From a clean microphone stub, assert the stage runs without any file/source input and can enter fullscreen. |
| U38 | “Pairing uses PeerJS’s public signalling service to introduce the two browsers.” — remote dialog | Names the third party and its network role. | Intercept pairing and assert only the disclosed PeerJS signalling origin is used before WebRTC connects. |
| U39 | “One-time purchase.” / “Sociobot/Dodo is the merchant of record and handles refunds.” — Venue Pack dialog | Commercial terms affect a purchase decision. | Assert the checkout describes a one-time $19 charge, names the merchant of record, and exposes its refund terms; otherwise link to exact terms rather than asserting them. |
| U40 | “Requires Node.js 20 or later.” — README | Developer compatibility claim. | Run install/test/build on the minimum supported Node 20 release and reject/document older versions. |
| U41 | “The exact production build command is `npm run build`.” — README | Reproducible-build claim. | Run that exact command in a clean clone and assert success; this review passed it but no registered claim test exists. |
| U42 | “Azure Static Web Apps routing and security headers are in `public/staticwebapp.config.json`.” — README | Deployment/security configuration claim. | Assert the file is emitted and verify the declared headers and fallback against a deployed preview. |
| U43 | “Left/right arrows: previous/next specimen”; “`F`: enter or leave full screen”; “`H`: hide or show chrome”; “`C`: open tuning controls”; “`R`: open phone pairing”; “Space: stop listening and return to setup.” — README | Six keyboard behavior claims. | In `/demo`, exercise every key and assert the named state/result, including focus after stop. |
| U44 | “Vite and strict vanilla TypeScript keep the initial bundle small.” — README | “Small” is a quantitative performance promise without a number. | Replace it with a measured gzip limit and assert that limit after build, or remove “small.” |
| U45 | “Generated artwork disclosed in the field notes.” — landing footer | Provenance/disclosure claim. | Assert `/about` contains the generator, date, provenance, and asset reference, and include this location in the claim entry. |

### BLOCKING B4 — broken routing and no designed 404

- Quote/evidence: `/this-route-does-not-exist` returns HTTP 200 with title **“Milkdrop Web — sound grows here”** and h1 **“Sound grows here.”** `/demo` returns the same normal landing route.
- Why this loses a visitor: an invalid or shared URL silently masquerades as home, and the required demo URL does not represent demo state. The work order explicitly makes broken routing blocking.
- Concrete fix: render a styled Not Found route with its own h1, title **“Page not found — Milkdrop Web,”** and a **“Return home”** link; configure a true 404 response where hosting permits. Give `/demo` its own route and title **“Demo — Milkdrop Web.”**

## Additional findings, ordered by severity

### HIGH H1 — route metadata is incomplete

- Quote: home title **“Milkdrop Web — sound grows here.”**
- Why: “sound grows here” is marketing metaphor, not what the product does. There is no canonical link, Open Graph title/description/image, Twitter card, or apple-touch icon on any route. `/demo` and unknown routes inherit the home title and description.
- Concrete fix: use **“Milkdrop Web — room music visualizer”** and route-specific plain titles/descriptions. Add a canonical URL per route, OG/Twitter metadata with an original 1200 × 630 image, and a 180 px apple-touch icon.

The SVG favicon, `lang="en"`, meta description, `<main>`, and one visible h1 were present. `/privacy`, `/terms`, and `/about` had route-specific titles.

### HIGH H2 — navigation does not manage route focus

- Quote/evidence: after following **“Privacy”**, `document.activeElement` was `BODY`, not the new h1. After browser Back, focus again remained on `BODY`.
- Why: screen-reader and keyboard users receive no focus or live announcement identifying the new page. Navigation uses full document loads rather than the specified History API route behavior.
- Concrete fix: on internal navigation and popstate, render the route, update history/title, focus a `tabindex="-1"` h1, and announce its text in an `aria-live="polite"` region. Preserve or deliberately restore scroll.

### HIGH H3 — the required landing skeleton is incomplete

- Quote: the page moves from **“Sound grows here”** to a decorative fern and a three-row definition list; paid details exist only in a modal.
- Why: there is no visible one-click demo/live product preview, no standalone “How it works” heading with real UI, and no plain “What it does not do” section. The header changes on legal routes because both product-nav controls are hidden. The footer omits “Built by Param Factory” and a build/version id.
- Concrete fix: follow the required information order: header with Demo and Privacy links; direct sample stage; three headed steps; limitations/privacy; exact $19 tier; consistent footer with one-line description, Privacy, Terms, factory attribution, and version.

### MEDIUM M1 — README has two sentences over 22 words

- Quote (27 words): **“Open the site, let the browser listen to the room, and run a full-screen visual instrument without routing Spotify, a mixer, or an audio file into it.”**
- Why: it combines setup, outcome, and comparison in one sentence.
- Rewrite: **“Open the site and let it hear music playing in your room. It turns the beat into full-screen visuals without audio routing.”**
- Quote (26 words): **“The researched scope is in `.factory/brief.json`, visual decisions and generated-asset provenance are in `.factory/design.md`, and release verification is in `.factory/handoff.md`.”**
- Why: it combines three document destinations.
- Rewrite: **“See `.factory/brief.json` for scope. See `.factory/design.md` for visual decisions and asset provenance. See `.factory/handoff.md` for release verification.”**

### MEDIUM M2 — metaphors and jargon obscure the job

Each row is a copy finding.

| Quote | Problem | Proposed rewrite |
| --- | --- | --- |
| “Sound grows here.” | Metaphorical headline; no job or audience. | “Turn room music into full-screen visuals.” |
| “living, beat-aware specimen” | “Specimen” is product lore, not an immediately understood output. | “full-screen visual that reacts to the beat” |
| “Field instrument 01” / “Local audio study” | Decorative taxonomy labels do not help a cold visitor. | “Room music visualizer” / “Microphone stays local” |
| “The room mic hears dynamics, not words.” | “Dynamics” is audio jargon and “hears” overstates interpretation. | “The microphone measures volume and pitch ranges, not speech.” |
| “Onsets and tempo shape every scene.” | “Onsets” is specialist jargon; “scene” changes the term. | “Beats and tempo change each visual.” |
| “Twelve original specimens rotate with the phrase.” | “Specimens” and “phrase” hide the actual timing and behavior. | “Choose from 12 visuals, or change them automatically about every 16 beats.” |
| “Local FFT, adaptive onset detection, tempo estimate, downbeat emphasis, and 16-beat phrase rotation” | Acronyms and signal-processing terms appear before a plain explanation. | “The visuals react to beats and can change after about 16 beats.” |
| “compact original WebGL fragment shader” | “Compact” is unmeasured and the implementation phrase is dense. | “The visuals use a WebGL shader. Remote code loads only when you open phone pairing.” |
| “rare specimens” / “Sharper 4K” | Marketing adjectives are not quantified. | “four paid visuals” / “4K canvas size control” |

No attached banned word appears verbatim. The problem is metaphor, specialist vocabulary, and unmeasured adjectives.

### MEDIUM M3 — terms for the same concepts change

| Concept | Terms found | Use consistently |
| --- | --- | --- |
| Input permission | mic, room mic, microphone | microphone |
| Rendered choice | specimen, preset, scene, visual | visual |
| Fullscreen | full-screen, full screen, fullscreen | full screen (prose), Full screen (control) |
| Paid tier | Venue pack, Venue Pack | Venue Pack |
| Remote | Phone remote, remote, phone pairing | phone remote |
| Colour choice | palette, pigment set, colour controls | color palette |

- Why: a first-time visitor must learn several labels for one thing.
- Concrete fix: adopt the last-column vocabulary in landing copy, controls, README, and accessibility names.

### MEDIUM M4 — two header buttons do not name a result

- Quote: **“Phone remote”** and **“Venue pack.”**
- Why: both are noun labels, so the result of activation is unclear; they also open dialogs while visually competing with the first action.
- Concrete fix: use **“Pair a phone”** and **“See Venue Pack”**. The primary **“Listen to the room”** action already names a result and can remain.

### MINOR L1 — external links are not identified

- Quote: **“Source”** and **“Buy the venue pack — $19.”**
- Why: the former opens GitHub and the latter redirects to Dodo checkout, but neither indicates that navigation leaves the site.
- Concrete fix: add visible or accessible **“(opens external site)”** text and use consistent external-link treatment.

## Complete copy audit

Word count uses words/numbers, treating hyphenated compounds as one word. `FLAG` points to a finding above; `CLAIM` points to the unlisted-claim table. Sentence fragments, headings, labels, and actions are included separately so button and out-of-context heading checks are not omitted.

### Landing document — every sentence

| # | Exact sentence | Words | Audit |
| --- | --- | ---: | --- |
| L01 | Turn the music already playing in your room into beat-aware, full-screen botanical visuals. | 13 | CLAIM U01; jargon M2/M3 |
| L02 | Audio never leaves your device. | 5 | CLAIM U02 |
| L03 | You’re offline. | 2 | — |
| L04 | The visualizer still works; remote pairing and license checks will wait. | 11 | CLAIM U03 |
| L05 | A new field guide is ready. | 6 | “field guide” metaphor; rewrite “An update is ready.” |
| L06 | Sound grows here. | 3 | BLOCKING B1; M2 |
| L07 | Open the mic. | 3 | CLAIM U04; terminology M3 |
| L08 | Fill the screen. | 3 | CLAIM U05; terminology M3 |
| L09 | Watch whatever is playing in the room become a living, beat-aware specimen. | 12 | BLOCKING B1; CLAIM U06; M2 |
| L10 | Processed only on this device. | 5 | CLAIM U07; missing subject; rewrite “Microphone audio is processed on this device.” |
| L11 | Never recorded. | 2 | CLAIM U08; missing subject; rewrite “Microphone audio is never recorded.” |
| L12 | A pressed fern unfurls into concentric sound waves and golden pollen on a dark field-guide plate. | 16 | Alt text; clear for its decorative/art purpose |
| L13 | The room mic hears dynamics, not words. | 7 | CLAIM U09; M2/M3 |
| L14 | Onsets and tempo shape every scene. | 6 | CLAIM U10; M2/M3 |
| L15 | Twelve original specimens rotate with the phrase. | 7 | CLAIM U11; M2/M3 |
| L16 | The microphone stayed closed. | 4 | Clear error summary |
| L17 | Allow microphone access in your browser’s site settings, then try again. | 11 | Clear next action |
| L18 | Made for rooms that already have music. | 7 | Audience remains vague; rewrite “For parties, rehearsals, and venues with music already playing.” |
| L19 | Generated artwork disclosed in the field notes. | 7 | CLAIM U45; passive; rewrite “Read how we made the artwork.” |
| L20 | Scan once. | 2 | Incomplete outcome; rewrite “Scan the code to pair your phone.” |
| L21 | Your phone sends preset and colour controls directly to this screen; microphone audio never leaves it. | 16 | CLAIM U12; terminology M3 |
| L22 | Pairing uses PeerJS’s public signalling service to introduce the two browsers. | 11 | CLAIM U38; necessary disclosure; define “signalling” as “connection service” |
| L23 | Control messages then travel peer to peer. | 7 | CLAIM U13; “peer to peer” jargon; rewrite “The two browsers then send controls directly to each other.” |
| L24 | If a network blocks WebRTC, the visualizer keeps working normally. | 10 | CLAIM U14; define WebRTC as “phone connection” in user copy |
| L25 | One-time purchase. | 2 | CLAIM U39; paid-term claim should join the tested price statement |
| L26 | Sociobot/Dodo is the merchant of record and handles refunds. | 10 | CLAIM U39; necessary commercial disclosure |
| L27 | The eight free specimens remain yours to use. | 8 | CLAIM U18; terminology M3 |
| L28 | Have a license? | 3 | Clear prompt |
| L29 | Paste it here. | 3 | Vague out of context; rewrite label “License key” and action “Restore purchase” |

No landing sentence exceeds 22 words.

### Landing document — headings, labels, and actions

| Copy (word count) | Audit |
| --- | --- |
| Skip to main content (4) | Clear result-naming link |
| Milkdrop Web (2) | Product wordmark |
| Phone remote (2) | M4; use “Pair a phone” |
| Venue pack (2) | M3/M4; use “See Venue Pack” |
| Field instrument 01 (3) | M2 |
| Local audio study (3) | M2 |
| Listen to the room (4) | Clear primary verb, but no sample alternative |
| FIG. 01 (2) | Decorative label |
| Dryopteris sonora — a study in room sound (7) | Decorative jargon; keep only as art caption |
| 01 / Listen (2) | Understandable with its description |
| 02 / Find the pulse (4) | “pulse” metaphor; use “Detect the beat” |
| 03 / Let it grow (4) | Metaphor; use “Change the visuals” |
| Update now (2) | Clear result-naming action |
| Try the mic again (5) | Clear result-naming action |
| Preview without a mic (5) | Names a result, but hidden and not a sandbox |
| Room mic live (3) | M3 |
| Listening for a pulse (4) | M2 |
| Now growing (2) / Fern echo (2) | Product flavor; not clear out of context |
| Tune (1) | Vague; use “Tune visuals” |
| Show controls (2) | Clear result-naming action |
| Specimen conditions (2) / Tune the growth (3) | M2; use “Visual settings” / “Tune visuals” |
| Motion intensity (2) / Mic sensitivity (2) | Use “Motion amount” / “Microphone sensitivity” |
| Pigment set (2) | M3; use “Color palette” |
| Lichen & pollen (2); Coral & moss (2); Moonlit cyanotype (2); Plum & foxglove (2) | Distinct palette names; “cyanotype” may need a visible color swatch |
| Phrase-aware rotation (2) / Change specimen after roughly 16 beats (6) | M2/M3; use “Change visual every 16 beats” |
| Venue pack tools (3) | M3 capitalization |
| Local logo overlay (3) / 4K tuning (2) | Paid features; subject to U16/U17 |
| Sharper output; uses more GPU power (6) | Unquantified “sharper”; use exact canvas limit |
| Stop listening (2) / Apply tuning (2) | Clear result-naming actions |
| Private control link (3) | “Private” needs the U12/U13 proof |
| Use your phone as a remote (6) | Clear heading |
| Room code (2) / Preparing… (1) / Creating a private room… (4) | “Private” needs network-boundary proof |
| Copy remote link (3) | Clear result-naming action |
| Connection note (2) | Understandable |
| One-time license · $19 USD (4) | Exact commercial label; requires checkout test |
| Take the field guide to the venue (7) | Metaphor; use “Add four venue visuals and 4K controls” |
| Four rare specimens, for twelve total (6) | CLAIM U15; replace “rare” |
| Local logo overlay — the image stays on this device (9) | CLAIM U16 |
| Sharper 4K rendering controls (4) | CLAIM U17 |
| Buy the venue pack — $19 (5) | Clear result and price; capitalize Venue Pack |
| Restore purchase (2) | Clear result-naming action |
| Privacy (1) / Terms (1) / Source (1) | Clear link nouns; Source needs external indication |

### README — every sentence and list item

| # | Exact copy | Words | Audit |
| --- | --- | ---: | --- |
| R01 | Mic-driven, beat-aware visuals for parties, jam rooms, bars, TVs, and projectors. | 11 | CLAIM U36; plain after replacing “beat-aware” with “react to the beat” |
| R02 | Open the site, let the browser listen to the room, and run a full-screen visual instrument without routing Spotify, a mixer, or an audio file into it. | 27 | CLAIM U37; FLAG M1 |
| R03 | Twelve original WebGL botanical specimens: eight free and four in the Venue Pack | 13 | CLAIM U19; jargon M2 |
| R04 | Local FFT, adaptive onset detection, tempo estimate, downbeat emphasis, and 16-beat phrase rotation | 13 | CLAIM U20; jargon M2 |
| R05 | Phone remote over an encrypted WebRTC data channel, paired by QR or room link | 14 | CLAIM U21; jargon M2 |
| R06 | Four palettes, motion and microphone tuning, keyboard operation, and full-screen mode | 11 | CLAIM U22; M3 |
| R07 | Optional one-time $19 Venue Pack with rare specimens, a local-only logo overlay, and 4K tuning | 15 | CLAIM U23; “rare” marketing adjective |
| R08 | Installable/offline-capable app shell with no tracking or third-party runtime assets | 11 | CLAIM U24; slash compound and developer jargon |
| R09 | Microphone audio is analysed only in browser memory. | 8 | CLAIM U25 |
| R10 | It is never recorded or uploaded. | 6 | CLAIM U26; name “Microphone audio” again |
| R11 | The optional remote uses PeerJS’s public signalling service for connection setup; only control messages are sent. | 16 | CLAIM U27; necessary disclosure, define “signalling” |
| R12 | Requires Node.js 20 or later. | 6 | CLAIM U40; clear prerequisite |
| R13 | Microphone access requires `localhost` or HTTPS. | 6 | CLAIM U28 |
| R14 | To use the phone remote, both browsers need internet access for signalling and a network that permits WebRTC. | 18 | CLAIM U29; jargon but useful prerequisite |
| R15 | The exact production build command is `npm run build`. | 9 | CLAIM U41; clear developer instruction |
| R16 | It writes a static site to `dist/`, with `dist/index.html` at the deploy root. | 15 | CLAIM U30 |
| R17 | Azure Static Web Apps routing and security headers are in `public/staticwebapp.config.json`. | 14 | CLAIM U42; clear developer reference |
| R18 | Left/right arrows: previous/next specimen | 6 | CLAIM U43; M3; use “visual” |
| R19 | `F`: enter or leave full screen | 6 | CLAIM U43; M3 |
| R20 | `H`: hide or show chrome | 5 | CLAIM U43; “chrome” jargon; use “controls” |
| R21 | `C`: open tuning controls | 4 | CLAIM U43 |
| R22 | `R`: open phone pairing | 4 | CLAIM U43; M3; use “phone remote” |
| R23 | Space: stop listening and return to setup | 7 | CLAIM U43 |
| R24 | On touch screens, all functions are available through labelled controls. | 10 | CLAIM U31 |
| R25 | If microphone access fails, the launch sheet explains how to retry and offers a no-mic preview. | 16 | CLAIM U32; “launch sheet” metaphor |
| R26 | Vite and strict vanilla TypeScript keep the initial bundle small. | 10 | CLAIM U44; “small” is unquantified; state gzip bytes or remove |
| R27 | Web Audio provides raw frequency data with AGC, echo cancellation, and noise suppression explicitly disabled. | 15 | CLAIM U33; developer jargon is acceptable only in Architecture |
| R28 | The renderer is a compact original WebGL fragment shader; dependencies for QR generation and WebRTC load only when remote pairing opens. | 21 | CLAIM U34; dense and “compact” unquantified |
| R29 | Preferences and license state are local-first. | 6 | CLAIM U35; “local-first” undefined and qualified by network license checks |
| R30 | The researched scope is in `.factory/brief.json`, visual decisions and generated-asset provenance are in `.factory/design.md`, and release verification is in `.factory/handoff.md`. | 26 | FLAG M1 |
| R31 | MIT. | 1 | Clear license |
| R32 | See `LICENSE`. | 2 | Clear action |

README headings/labels: **Milkdrop Web (2), Live (1), What ships (2), Run locally (2), Test and build (3), Controls (1), Architecture (1), License (1).** “What ships” is developer idiom; **“Included features”** is clearer out of context. The other headings identify their sections.

## Structure, behavior, and accessibility results

| Check | Result | Evidence |
| --- | --- | --- |
| Mobile and desktop cold load | Fail first-read audience | B1; cold screenshots captured |
| One h1 / `<main>` / `lang` | Pass | One visible h1, one main, `lang=en` on checked routes |
| Title pattern | Fail | Home uses metaphor; `/demo` and unknown route inherit it |
| Description | Partial | Present on home but static across routes |
| Canonical / OG / Twitter / apple icon | Fail | All absent; SVG favicon present |
| Deep links | Partial | `/privacy`, `/terms`, `/about` return correct content; `/demo` and unknown paths do not |
| Back button | Partial | Returns to `/`, but focus remains on `BODY` |
| Route-change focus/live announcement | Fail | H2 |
| 404 | BLOCKING fail | B4 |
| Link crawl | Pass for reachability | Same-origin links returned 200; checkout returned an expected 303; GitHub returned 200 |
| External-link disclosure | Minor fail | L1 |
| Header/footer consistency | Fail | Product nav is removed on legal routes; footer lacks factory/build details |
| Visual identity | Pass | The herbarium sheet, fern artwork, paper/forest palette, and botanical control language are product-specific, not a generic SaaS card/gradient template |
| Axe | Pass in sampled states | Zero violations on cold mobile and desktop landing pages |
| Browser console/page errors | Pass in sampled states | None on cold mobile and desktop landing pages |
| Initial network privacy | Pass in sampled state | Cold load requested only the product origin |
| Preview network privacy | Pass in sampled state | Forced no-mic preview requested only the product origin |
| Demo storage isolation | BLOCKING fail | Shared `milkdrop:*` keys changed |
| Offline exploratory reload | Pass | Cached shell reloaded offline and displayed the offline banner |
| Reduced motion | Sampled | Browser context requested reduced motion; no axe or console error occurred |

## Acceptance decision

**FAIL.** A PASS requires zero blocking findings and no more than three minor findings. This review has four blocking findings, four high/medium copy and structure findings, and one minor finding. The passing build, unit, axe, console, link-reachability, offline-shell, and same-origin exploratory checks do not offset the missing demo sandbox, claims contract, audience statement, or 404 route.
