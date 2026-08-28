# Milkdrop Web — perfection-loop repair handoff

## Outcome

All blocking and additional findings in `.factory/review-1.md` are resolved. The product remains a Vite + vanilla TypeScript static web app with its nocturnal botanical field-guide identity.

## Repair delivered

- Replaced the first-screen metaphor with the job, audience, next step, and three tested facts.
- Added one-click `/?demo=1` and `/demo` entry points. The bundled 120 BPM sample starts immediately in isolated memory.
- Added the persistent demo banner, **Reset demo**, and **Start for real**. Tests prove real preferences and license keys are untouched.
- Added `.factory/claims.json` with ten observable claims and one tagged browser test per claim.
- Added route-specific titles, descriptions, canonical/OG/Twitter metadata, original 1200 × 630 social art, and a 180 px touch icon.
- Added History API navigation, route announcements, heading focus, browser Back handling, and a styled 404 with a real static-host 404 response.
- Completed the landing-page structure, consistent legal links, privacy/terms/about routes, responsive 390 px layout, labelled touch controls, dialog focus return, and reduced-motion behavior.
- Fixed service-worker asset matching, MIME-safe offline reload, deterministic update versioning, and first-install reload behavior.
- Preserved the generated cut-paper herbarium art and procedural botanical WebGL visuals. Provenance is recorded in `.factory/design.md` and `/about`.
- Updated the README, demo contract, copy audit, catalog description, routing/security config, and Playwright 1.58.2 pin.

## Clean-clone verification

Final deployed-code proof clone: `/tmp/milkdrop-deployed-proof-gJ9Cfw` at commit `f0413008f696d60d37c12daaedd5db570ef14846`.

- `npm ci`: passed; 0 vulnerabilities.
- `npm test`: passed, 3/3 unit tests.
- `npm run build`: passed; `dist/index.html`, `dist/sw.js`, and Azure configuration emitted.
- Every command in `.factory/claims.json`: passed independently, 10/10.
- `npm run test:browser`: passed, 19/19.
- `npm run audit`: zero axe violations on `/`, `/demo`, `/privacy`, `/terms`, `/about`, and the unknown route; zero console errors; one h1 per route; zero mobile overflow.
- `npm run audit:pwa`: offline reload passed, cached JS/CSS MIME types passed, and app-only service-worker update passed.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.7 s, CLS 0, TBT 0 ms. JSON: `/tmp/milkdrop-lighthouse-final.json`.
- `git diff --check`: passed.

Build budgets:

- Initial JavaScript: 36.34 KB raw / 13.43 KB gzip.
- CSS: 19.55 KB raw / 5.17 KB gzip.
- Mobile hero AVIF: 27.90 KB.
- Social preview JPEG: 138 KB.

Reviewed screenshots:

- `/tmp/milkdrop-home-mobile.png`
- `/tmp/milkdrop-home-desktop.png`
- `/tmp/milkdrop-demo-actual.png`

## Run and verify

```bash
npm ci
npm test
npm run build
npm run test:browser
npm run audit:pwa
```

For `npm run audit`, serve `dist/` first with `npm run preview -- --host 127.0.0.1`.

## Deployment

Static deployment uses:

```bash
/opt/fleet/lib/deploy-static.sh milkdrop-web /work/repo/dist
```

Deployment succeeded through that command with Azure deployment ID `50d18c1c-1541-46df-8f4c-9fb4c78f4b64`.

Live URL: <https://milkdrop-web.sociobot.in>

- `/opt/fleet/lib/verify-url.sh`: passed; HTTP 200, correct title and language, one h1, main landmark, complete image alt text, labelled buttons, and zero console errors. Evidence: `/tmp/milkdrop-verify-final/`.
- Live `/demo`, `/privacy`, `/terms`, and `/about`: HTTP 200 with correct client-rendered titles and one h1.
- Live `/?demo=1`: demo banner and running demo stage verified at 390 × 844.
- Live unknown route: HTTP 404 with title **Page not found — Milkdrop Web** and the designed field-guide 404 page.
- Live security headers: CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, referrer policy, and microphone-only permissions policy present.
- `npx @axe-core/cli https://milkdrop-web.sociobot.in`: zero violations. Evidence: `/tmp/milkdrop-axe-live.json`.

## Known gaps

No review-blocking finding remains. The sandbox uses a deterministic microphone/Web Audio stub because this container has no physical microphone. The production checkout link and license contract are exercised without making a real purchase.
