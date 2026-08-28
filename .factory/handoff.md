# Milkdrop Web — review 1 handoff

## Outcome

Adversarial first-read review 1 is complete. Verdict: **FAIL**.

The full evidence and concrete fixes are in [`.factory/review-1.md`](review-1.md). No product code was changed.

## Blocking findings

1. The cold first screen does not name its audience.
2. There is no visible one-click sample demo, `/demo` does not enter demo mode, and the hidden preview writes to real `milkdrop:*` storage.
3. `.factory/claims.json` is absent, so no public claim has a registered claim test.
4. Unknown URLs return the home screen with HTTP 200 instead of a designed 404.

## Verification performed

- Opened production in fresh Chromium contexts at 390 × 844 and 1440 × 900 before scrolling.
- Exercised `/demo`, the hidden no-mic preview, preset changes, offline reload, storage, and request interception.
- Crawled all landing-page links and checked `/`, `/demo`, `/privacy`, `/terms`, `/about`, and an unknown route.
- Checked metadata, headings, route focus, browser Back, console errors, and axe results.
- Audited every landing-document and README sentence/list item with word counts, terminology, jargon, actions, claims, and rewrites.
- Created a clean clone at `/tmp/milkdrop-web-review-1-clean` at `7650ddcc2beae9df49ca74753ea6d7e672e698ca`.
- Ran `npm ci`, `npm test` (3/3 passed), and `npm run build` (passed; `dist/` generated) in that clean clone.

Screenshots from this disposable review container:

- `/tmp/milkdrop-review-mobile.png`
- `/tmp/milkdrop-review-desktop.png`

## Known limitations

- No claim command could be run because `.factory/claims.json` does not exist. The general unit tests are not substitutes for tagged claim tests.
- Microphone hardware was not available. The review used the shipped no-mic preview and did not assert real acoustic beat detection.
- Checkout reachability was checked without purchasing: the Sociobot endpoint returned a 303 redirect to hosted checkout.

## Recommended next step

Implement the `/demo` sandbox and claims registry first, then replace the first-screen copy and add proper route/404 handling. Rerun every registered claim from a clean demo context before requesting another first-read review.
