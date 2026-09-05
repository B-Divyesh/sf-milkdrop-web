# Milkdrop Web — repair 2 handoff

## Outcome

All five findings in `.factory/review-2.md`, including the minor copy finding, are resolved. Earlier review findings remain fixed. The deployed product is the Vite and vanilla TypeScript static app at <https://milkdrop-web.sociobot.in>.

Implementation and deployment SHA: `ada4cc4194323a43278a3b766455637319afe05b`.

The later documentation commit contains this handoff only. Its SHA is recorded in the final work-order response because a commit cannot contain its own hash.

## Review 2 finding disposition

- **F-2-1:** The server-returned 404 now includes Open Graph, Twitter, touch-icon, canonical, title, description, and favicon metadata. It uses the standard navigation and footer and keeps the real HTTP 404 status.
- **F-2-2:** Each history entry records scroll coordinates and focused control. Back and Forward restore both values while announcing the destination heading.
- **F-2-3:** The demo keeps a compact branded header and footer. Its stage controls have clear reserved space on phones. The static 404 uses the same shell. The next-step line and all three facts end at 727 px in the 1440 × 900 first screen.
- **F-2-4:** “Audio routing,” “WebGL visuals,” “app shell,” and “dist root” were removed from first-use and README copy. The 404 heading is now literal. `.factory/copy-audit.md` records the replacements.
- **F-2-5:** `license-verification-cadence` is a declared claim. Its browser test controls the clock and proves one request inside 24 hours and a second request at the boundary.

## Clean-checkout verification

Detached proof checkout: `/tmp/milkdrop-repair2-proof` at the implementation SHA.

- `npm ci`: passed; 97 packages installed and 0 vulnerabilities.
- `npm test`: passed, 3/3 unit tests.
- `npm run build`: passed and emitted `dist/index.html`, `dist/sw.js`, and `dist/staticwebapp.config.json`.
- Every command in `.factory/claims.json` was run separately: 11/11 passed.
- `npm run test:browser`: passed, 22/22 browser tests.
- `npm run audit:pwa`: passed offline reload, cached JavaScript/CSS MIME checks, and the explicit update flow.
- `npm run audit`: passed mobile/desktop home and all routes with no axe violations, console errors, overflow, or heading failures.
- Axe CLI 4.13.0: zero violations on home, demo, privacy, terms, and about.
- Lighthouse mobile locally: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- `git diff --check`: passed.

Build budgets:

- Initial JavaScript: 38.14 KB raw / 13.98 KB gzip.
- CSS: 21.42 KB raw / 5.50 KB gzip.
- Mobile hero AVIF: 27.90 KB.
- Lighthouse initial transfer: 95 KiB.

## Deployment and live verification

Deployment command:

```bash
/opt/fleet/lib/deploy-static.sh milkdrop-web /work/repo/dist
```

Azure deployment ID: `2b5b595f-ca33-4de9-8a9a-cb7da43044e4`.

- The live and local `index.html` SHA-256 values both equal `e3d67dc6189d8fc71e4170e3564eabc74d0e36ff0518084b716e2f4061080c28`.
- `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, the correct title/language, one h1, one main, complete alt text, labelled buttons, and no console errors.
- Fresh 390 × 844 and 1440 × 900 contexts showed the job, audience, primary microphone action, sample action, next step, and three facts before scrolling.
- The live demo started at Fern echo with a 120 BPM sample, changed to Pollen orbit, reset to Fern echo and lichen, and retained seeded real preferences and license data byte-for-byte.
- The live demo exposed one header and one footer without covering its controls. Start for real removed the demo banner.
- Live Back restored scrollY 2143 and footer Privacy focus. Forward restored scrollY 320 and the Privacy heading focus.
- A fresh live service worker reload kept the demo usable offline and allowed the visual to change.
- A live phone page paired with the display and changed its visual to Pollen orbit.
- The unknown route returned HTTP 404 with the full 404 metadata and standard shell.
- Live browser audit and axe CLI found zero violations and zero console errors on all reviewed routes.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 30 ms.
- Live responses include CSP with `frame-ancestors`, HSTS, frame denial, MIME protection, referrer policy, and microphone-only permissions policy. Hashed assets use one-year immutable caching; `sw.js` uses no-store.
- The production checkout returned the expected hosted-checkout redirect. An invalid license returned the expected inactive result. No purchase was started.

## Evidence

- Local axe JSON: `/tmp/milkdrop-axe-local.json`
- Live axe JSON: `/tmp/milkdrop-axe-live-repair2.json`
- Local Lighthouse JSON: `/tmp/milkdrop-lighthouse-local.json`
- Live Lighthouse JSON: `/tmp/milkdrop-lighthouse-live-repair2.json`
- Live URL verification: `/tmp/milkdrop-repair2-live/`
- Reviewed screenshots: `/tmp/milkdrop-repair-home-mobile.png`, `/tmp/milkdrop-repair-home-desktop.png`, `/tmp/milkdrop-repair-demo-mobile.png`, `/tmp/milkdrop-repair-demo-desktop.png`, and `/tmp/milkdrop-repair-404-mobile.png`

## Known limits

- This container has no physical microphone. The automated microphone path uses deterministic MediaStream and Web Audio stubs; a real-device acoustic check remains prudent before a venue event.
- Phone pairing depends on the disclosed public PeerJS connection service and on WebRTC being allowed by the network. Pairing failure leaves the local visualizer running.
- No paid purchase was made. Checkout availability, cached entitlement behavior, invalid-license recovery, and paid controls were verified without spending money.
- Pre-existing modified `graphify-out` files were not staged, committed, or used for the deployment.
