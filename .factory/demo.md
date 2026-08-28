# Demo sandbox

## Entry points

- Catalog and claim-test URL: `https://milkdrop-web.sociobot.in/?demo=1`
- Clean route alias: `https://milkdrop-web.sociobot.in/demo`
- Local URL: `http://127.0.0.1:4173/?demo=1`

Both entry points start the visualizer in one click or less. They use the bundled 120 BPM sample signal and open without microphone permission.

## Sample data

The deterministic signal supplies bass, middle, and high frequency levels. It emits one beat every 500 milliseconds and a phrase event every 16 beats.

The sample starts on **Fern echo**. The eight free visuals, four color palettes, motion setting, automatic changes, full-screen control, and phone-pairing error state can be exercised.

## Isolation

Demo state is kept in JavaScript memory. It never reads or writes these real-mode keys:

- `milkdrop:preset`
- `milkdrop:preferences`
- `sb_license:milkdrop-web`
- `sb_license:milkdrop-web:verdict`

The demo does not create IndexedDB or OPFS data. **Reset demo** destroys the running sample and creates a fresh in-memory state. **Start for real** destroys it and returns to `/`.

## Verification

Run `npm run test:claims`. The `demo-isolation` test seeds real keys, operates the sample, resets it, leaves it, and verifies the sentinels never changed.
