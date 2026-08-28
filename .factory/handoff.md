# Review 2 handoff — Milkdrop Web

## Outcome

Adversarial first-read review 2 is complete. Verdict: **FAIL** with five findings in `.factory/review-2.md`. Product code was not modified.

## What was checked

- Live mobile 390 × 844 and desktop 1440 × 900 first screens.
- One-click demo, running sample, banner, Reset, Start for real, storage isolation, same-origin requests, and offline reload.
- Every test command in `.factory/claims.json`, independently, from clean clone `/tmp/milkdrop-review-2-clean-udPDic` at commit `83024c6058860ff675e18e97eb46a72f9339c8b9`.
- Full unit, build, Playwright, PWA, live axe, route metadata, deep-link, Back, focus, link crawl, 404, and visual-identity checks.
- Every finding in `.factory/review-1.md`; no `.factory/polish-*.md` files exist.
- Complete landing-page and README copy audit with word counts.

## Verification results

- All 10 declared claim commands passed.
- `npm test`: 3/3 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:browser`: 19/19 passed.
- `npm run audit:pwa`: passed.
- Live axe checks found zero violations on all reviewed routes.

## Remaining work

See F-2-1 through F-2-5 in `.factory/review-2.md`. Blocking items are incomplete 404 metadata, missing Back/Forward scroll restoration, inconsistent demo/404 shells plus desktop first-screen clipping, and remaining plain-language jargon. The privacy page also has an unlisted once-per-day license-verification claim.

Pre-existing modified and untracked `graphify-out` files were left untouched and excluded from the review commit.
