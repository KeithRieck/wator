## 1. Project scaffolding

- [x] 1.1 Create `package.json` with Vite, TypeScript, and `phaser` (devDependency for types only); run `npm install` and verify it succeeds
- [x] 1.2 Create `tsconfig.json` with target ES2020 and module ESNext; verify `npx tsc --noEmit` runs clean on a stub file
- [x] 1.3 Create `vite.config.ts` with relative `base: './'`; verify `npm run build` emits static output into `dist/`
- [x] 1.4 Create `index.html` with the Phaser 4.x CDN script tag (`https://cdnjs.cloudflare.com/ajax/libs/phaser/4.2.1/phaser.min.js`) and ES module entry (`src/main.ts`); add an ambient global declaration for Phaser types; verify the page loads Phaser from CDN in a browser

## 2. Simulation engine (framework-free)

- [x] 2.1 Create `src/config.ts` exporting all model constants (grid dimensions 100x70, densities 30%/5%, breed times 3/25, shark energy values 5/3/1, colors, speed options with default 10x) and verify all constants are referenced from one importable module
- [x] 2.2 Implement abstract `Entity` class (id, x, y, breedAge, bornThisChronon, alive, readonly type discriminator, abstract `act(sim)`) with JSDoc class comment; verify it compiles with no Phaser imports
- [x] 2.3 Implement `Fish extends Entity` with BREED_TIME bound from config and `act()` covering move/reproduce/blocked-timer rules per wator-simulation Requirement 4; verify each scenario by tracing act outcomes against hand-built grids
- [x] 2.4 Implement `Shark extends Entity` with BREED_TIME and initial energy bound from config and `act()` covering energy-decrement-first, starvation death, hunt/eat/gain, empty-move, and reproduction rules per wator-simulation Requirement 5; verify each scenario against hand-built grids including starvation-before-move ordering
- [x] 2.5 Implement `WatorSimulation`: flat grid array + entity registry, toroidal orthogonal neighbor queries, random initial population at configured densities with no overlap, `moveEntity`/`spawnNewborn`/`removeEntity` primitives, chronon loop with Fisher–Yates shuffled IDs skipping dead and newborn entities per wator-simulation Requirements 1–3 and 6; verify a scripted multi-chronon run shows each entity acting at most once, newborns deferred, and eaten entities skipped
- [x] 2.6 Add extinction detection (`Sharks extinct`, `Fish extinct`, `Ecosystem collapsed`) and rolling 500-sample population history per wator-simulation Requirements 7–8; verify statuses trigger correctly in forced-extinction scenarios and history caps at 500 samples

## 3. Phaser app shell and scenes

- [x] 3.1 Create `src/main.ts` configuring `Phaser.Game` (Scale.RESIZE full-window, scene registration) and verify the game canvas fills the browser window
- [x] 3.2 Implement `BootScene` that creates the simulation and starts `SimulationScene`; verify launch goes straight to a running simulation at 10x with no landing screen (wator-ui Requirement 7)
- [x] 3.3 Implement `SimulationScene.update` accumulator loop mapping speed value to chronons/sec (1/5/10/30/60) with no catch-up behavior; verify observed step rates match selected speeds using chronon counter timing

## 4. Rendering and UI helpers

- [x] 4.1 Implement world rendering: water background, green fish circles, slightly larger blue shark circles, no grid lines, single Graphics redraw per frame, immediate updates without animation per wator-ui Requirement 2; verify visually and confirm grid-dimension constant changes rescale automatically (wator-app-shell Requirement 4)
- [x] 4.2 Implement layout function computing stats/world/controls/chart rectangles with wide layout (stats left, world center, controls right, chart bottom) and narrow reflow preserving world aspect ratio per wator-ui Requirements 3–4; verify at desktop width and iPad mini viewport (744x1133 CSS px), including a live resize keeping grid dimensions unchanged
- [x] 4.3 Implement stats panel showing Chronon, Fish, Sharks, Status with live values; verify counts match simulation state during a run
- [x] 4.4 Implement Phaser-native button helper (hit area, hover, disabled visual state) and use it for controls; verify pointer interaction works over the canvas
- [x] 4.5 Implement speed row (`1x`,`5x`,`10x`,`30x`,`60x` horizontal) and action rows (Play/Pause, Step, Reset — one per row) with running/paused/terminal enablement rules per wator-ui Requirements 5–6 and 8; verify live speed change while running, paused speed change not resuming, Step disabled while running, single-step while paused, and Reset producing a fresh running world at chronon 0 with cleared history
- [x] 4.6 Implement population history chart across the bottom: green/blue lines matching world colors, auto-scaled y-axis, no titles or labels per wator-ui Requirement 9; verify lines track populations over a several-hundred-chronon run

## 5. PWA packaging

- [x] 5.1 Create `manifest.webmanifest` (name, icons, display standalone) and generate 192px/512px icons drawing blue and green circles suggesting shark and fish on a water background; verify manifest loads without console errors
- [x] 5.2 Implement `sw.js` precaching same-origin build output with cache-first serving; register it from the app entry; verify second load serves from cache with the network throttled/offline for same-origin assets (CDN Phaser may require network per wator-app-shell Requirement 6)

## 6. Integration verification

- [x] 6.1 Run a full session: launch → observe running simulation → pause → step → change speeds → reset → let one species go extinct or force via temporary constants → confirm terminal status, locked Play, and Reset recovery; verify every wator-ui scenario end-to-end
- [ ] 6.2 Verify JSDoc coverage: every class has a documentation comment and every static/public method over 8 lines is documented (wator-app-shell Requirement 7)
- [ ] 6.3 Run final `npm run build`, deploy `dist/` contents to the GitHub Pages subpath, and verify the hosted app at `/wator/ox_alpha/` launches and runs correctly
