# Milkdrop Web — visual thesis

## Direction: a field guide that comes alive after dark

Milkdrop Web treats sound as a living specimen. The setup screen resembles a botanist's night field notebook: inked labels, specimen numbers, ruled annotations, pressed-leaf silhouettes, and a warm paper panel floating above a nearly black forest floor. Once listening begins, the interface withdraws and the specimen itself fills the screen. This makes the product feel like a deliberate party instrument, not a dashboard or a generic neon visualizer.

The product is intentionally single-mode. A dark surround gives projected colour maximum contrast, avoids flooding a room with white light, and keeps OLED/TV glare low. Warm paper is reserved for the setup sheet and controls; the canvas stays deep evergreen.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Forest floor | `#07120f` | Page and visualizer ground |
| Canopy | `#10251d` | Raised dark surfaces |
| Herbarium paper | `#f1ead8` | Setup sheet, primary light text |
| Ink | `#15231c` | Text on paper |
| Lichen | `#b8d46a` | Primary action, focus, beat status |
| Pollen | `#f2bc57` | Selected state, premium marker |
| Coral specimen | `#ee7968` | Warnings and hot accents |
| Fern | `#5bbf8a` | Success and live mic state |
| Muted paper ink | `#526259` | Secondary copy on paper |
| Mist | `#aabbb2` | Secondary copy on dark surfaces |

All body pairings meet WCAG AA. Pollen is used as a fill or large marker, not small text on paper. State is always reinforced with a label, icon, or shape.

## Type and spacing

- Display: Georgia, `Times New Roman`, serif — an available system face with the editorial authority of printed taxonomy; no font download is needed.
- Utility/body: `Trebuchet MS`, Arial, sans-serif — legible from across a room and compact on phones.
- Scale: 0.78rem specimen labels, 1rem body, 1.25rem lead, clamp(2.25rem, 7vw, 5.6rem) display.
- Spacing follows an 8 px base with 4 px optical adjustments. Controls are at least 48 px high and separated by at least 8 px.
- Hairline rules, bracket corners, italic Latin-style subtitles, and monospace specimen counters provide the field-guide grammar without literal skeuomorphism.

## Interaction grammar

- The primary action is a large lozenge labelled “Listen to the room”. Its mic icon, privacy note, and current capability status are adjacent.
- Controls appear as a bottom specimen drawer while visuals run. It can be hidden with `H`; any pointer movement or focus restores it.
- Presets are a horizontally scrollable strip of numbered specimens. Left/right arrows change specimens, space toggles listening, `F` enters fullscreen, `C` opens controls, and `H` hides chrome.
- Beat feedback is a breathing ring and plain-language “Beat found” / “Listening for a pulse” status. It never depends on colour alone.
- The remote is local-network peer pairing built with WebRTC. A QR is convenient, but the readable room link and copy action are always present. No audio or visualizer data is relayed through a server.

## Motion policy

UI transitions last 160–240 ms and use opacity/transform only. Canvas motion responds continuously to audio, but avoids full-frame white flashes and caps onset emphasis below 3 Hz. Auto-rotation uses a 700 ms botanical “cross-pollination” fade at estimated 16-beat phrase boundaries. When `prefers-reduced-motion` is set, the product defaults motion intensity to 35%, disables animated UI entrances and auto-rotation, and renders slowly changing low-displacement canvas forms; users can still opt into stronger visuals.

## Asset plan and provenance

The main product art is procedural WebGL/Canvas code: twelve original shader-inspired botanical presets written for this repository. The launch-sheet illustration is one generated cut-paper nocturnal herbarium composition, used as an atmospheric, non-functional image. Tiny icons and the fern mark are authored SVG/CSS.

### Image prompt sheet

**Subject:** a surreal pressed fern specimen whose fronds become concentric sound waves and pollen particles. **World/materials:** vintage botanical plate, torn black paper, pressed leaves, translucent vellum, powdered pigment, subtle paper fibres. **Light:** museum conservation-table side light with dark forest surround. **Lens/composition:** top-down, centered specimen, strong negative space, cropped as a wide landscape panel. **Palette words:** deep evergreen, herbarium cream, lichen chartreuse, pollen gold, restrained coral. **Negative list:** no people, no animals, no text, no letters, no numbers, no watermark, no logo, no interface, no neon gradient, no photorealistic brand objects.

Generated asset prompt: “A wide top-down editorial botanical field-guide plate at night: one original pressed fern specimen, its fronds subtly transforming into concentric sound-wave rings and drifting pollen grains, layered torn black paper and translucent vellum, powdered pigments and visible paper fibres, museum conservation-table side lighting, deep evergreen background, herbarium cream, lichen chartreuse, pollen gold and a restrained coral accent, centered specimen with generous negative space, refined cut-paper collage, tactile and sophisticated, no people, no animals, no text, no letters, no numbers, no watermark, no logos, no interface, no neon gradient.”

- Generator: Azure OpenAI image generation via the Param Factory `gen-image.sh` (`factory-image`).
- Date: 2026-08-27.
- Rights/provenance: original generated imagery for Milkdrop Web; no third-party or copyrighted character references.
- Source PNG and prompt sidecar live in `assets/src/`; optimized WebP/AVIF outputs live in `public/assets/`.

## Why this fits

Audio from a room is messy, organic, and ambient. A botanical taxonomy gives users memorable preset names and makes the product's analysis feel observational rather than invasive. The notebook-to-living-specimen transition also clarifies the flow: grant access on the sheet, then let the interface disappear so the room sees only the organism made by its sound.
