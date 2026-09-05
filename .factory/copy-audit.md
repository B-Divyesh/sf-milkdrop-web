# Copy audit — review 2 repair

Audited 5 September 2026. Counts treat hyphenated terms as one word. No sentence exceeds 22 words. No sentence uses a banned marketing word or avoidable technical jargon.

## First screen

| Sentence or action | Words | Result |
| --- | ---: | --- |
| Turn room music into full-screen visuals. | 6 | Pass: job-first headline |
| For party hosts, musicians, and venues using a TV or projector. | 11 | Pass: audience and situation |
| Listen to the room | 4 | Pass: primary action |
| Try it with sample data | 5 | Pass: sample action |
| Your browser will ask for microphone access, then open the visualizer. | 10 | Pass: next step |
| The sample opens without permission. | 5 | Pass |
| It listens through your device microphone; you do not connect the music source. | 13 | Pass; claim `microphone-privacy` |
| Microphone audio stays on this device. | 6 | Pass; claim `microphone-privacy` |
| Eight visuals are free; Venue Pack adds four. | 8 | Pass; claim `visual-count` |

## Landing sections

| Sentence or action | Words | Result |
| --- | ---: | --- |
| See the visualizer before opening your microphone. | 7 | Pass |
| The sample uses a bundled 120 BPM signal. | 8 | Pass; claim `demo-sample` |
| Change the visual, colors, and motion while it runs. | 9 | Pass; claim `controls-access` |
| Open the sample visualizer | 4 | Pass |
| How it works | 3 | Pass |
| Allow the room microphone. | 4 | Pass |
| Volume and pitch ranges move the visual. | 7 | Pass; claim `demo-sample` |
| Choose one, or switch about every 16 beats. | 8 | Pass; claim `demo-sample` |
| What it does not do | 5 | Pass |
| It does not identify songs, understand speech, record audio, or upload microphone audio. | 13 | Pass; claim `microphone-privacy` |
| It only measures sound ranges in browser memory. | 8 | Pass; claim `microphone-privacy` |
| Read the privacy details | 4 | Pass |
| Add four venue visuals and 4K controls. | 7 | Pass; claim `venue-pack` |
| A one-time $19 USD license adds four visuals, a local logo overlay, and a 4K canvas control. | 16 | Pass; claim `venue-pack` |
| The eight free visuals stay available. | 7 | Pass; claim `visual-count` |
| See Venue Pack details | 4 | Pass |

## States, dialogs, and footer

| Sentence or action | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Pass; claim `demo-isolation` |
| Reset demo / Start for real | 5 | Pass |
| The demo and visualizer still work. | 6 | Pass; claim `offline-reload` |
| Phone pairing and license checks need internet. | 7 | Pass |
| The microphone stayed closed. | 4 | Pass |
| Allow microphone access in this site’s settings, then try again. | 10 | Pass |
| Tune visuals / Motion amount / Microphone sensitivity / Color palette | 8 | Pass: consistent terms |
| Change visual about every 16 beats | 6 | Pass; claim `demo-sample` |
| Scan the code to pair your phone. | 7 | Pass |
| It sends visual and color controls to this screen. | 9 | Pass; claim `phone-pairing` |
| If pairing fails, the local visualizer keeps running. | 8 | Pass; claim `phone-pairing` |
| Four paid visuals, for twelve total | 6 | Pass; claim `visual-count` |
| Local logo overlay; the image stays in this browser session | 10 | Pass; claim `venue-pack` |
| 4K canvas size control, up to 3840 × 2160 | 8 | Pass; claim `venue-pack` |
| This is a one-time purchase. | 5 | Pass; claim `venue-pack` |
| Sociobot/Dodo is the merchant of record and handles eligible refunds. | 10 | Pass; claim `venue-pack` |
| Turn room music into full-screen visuals. | 6 | Pass |
| Built by Param Factory · v1.1.1 | 7 | Pass |

## README and 404 repair copy

| Sentence or action | Words | Result |
| --- | ---: | --- |
| You do not connect the music source to the app. | 10 | Pass; replaces “audio routing” |
| Eight free visuals and four Venue Pack visuals | 8 | Pass; removes implementation jargon |
| The demo and visualizer work offline after your first visit | 10 | Pass; claim `offline-reload` |
| The build writes a deployable static site to `dist/`. | 9 | Pass; plain developer instruction |
| This page could not be found. | 6 | Pass; plain 404 heading |
| The address does not match a page in Milkdrop Web. | 10 | Pass |
| Try the sample | 3 | Pass; recovery action |

## Terminology

| Concept | Required term |
| --- | --- |
| Input | microphone |
| Rendered choice | visual |
| Display mode | full screen |
| Paid tier | Venue Pack |
| Paired controller | phone remote |
| Color choice | color palette |

Botanical terms remain only in visual names and decorative field-guide labels. Functional instructions use the terms above.
