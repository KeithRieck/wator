## Why

The project needs its initial implementation: a browser-based Wa-Tor predator-prey simulation that emphasizes correct cellular-automaton behavior. The requirements are fully specified in `prd-v001.md`; this change turns them into the first working app, deployable as a static site at a repository subpath.

## What Changes

- Create a new static web app from scratch:
  - TypeScript source, built with Vite to ES2020 JavaScript modules; no backend.
  - Phaser 4.x loaded from a CDN script tag owns the entire browser window (rendering and input); no DOM overlays.
  - A framework-independent simulation engine (`WatorSimulation`) implementing Wa-Tor rules on a toroidal `100 x 70` grid.
  - Object-oriented entity model: abstract `Entity` base class with `Fish` and `Shark` subclasses; subclasses bind breeding thresholds and shark energy constants from shared config.
  - Chronon loop: randomized entity order, newborns deferred one chronon, dead entities skipped, shark energy decremented before movement/eating.
  - Phaser-native UI: stats panel (left), world view (center), controls (right: speed row + Play/Pause, Step, Reset), rolling population history chart across the bottom (500-chronon window).
  - Extinction detection with terminal statuses (`Sharks extinct`, `Fish extinct`, `Ecosystem collapsed`) and auto-pause.
  - Lightweight PWA: manifest, service worker caching same-origin assets, fish/shark circle icons.
- Add developer tooling: Vite build configured for relative-base subpath deployment, TypeScript config (ES2020 target, ESNext modules).

## Capabilities

### New Capabilities

- `wator-simulation`: The Wa-Tor simulation engine — grid initialization, toroidal orthogonal movement, fish/shark chronon rules, reproduction, shark energy/starvation, extinction detection, and population history sampling.
- `wator-ui`: The Phaser-native user interface — layout of stats/world/controls/chart, speed and action controls, run/pause/step/reset behavior, status display, rendering of creatures as circles, and responsive reflow.
- `wator-app-shell`: Application packaging and delivery — file organization, CDN Phaser loading via ES2020 modules, code-configurable constants, JSDoc documentation conventions, Vite build to static output, and PWA manifest/service worker support.

### Modified Capabilities

(none)

## Impact

- **New code**: `index.html`, `src/main.ts`, `src/config.ts`, `src/simulation/WatorSimulation.ts` (+ `Entity`, `Fish`, `Shark` classes), `src/scenes/BootScene.ts`, `src/scenes/SimulationScene.ts`, optional `src/ui/` helpers, `sw.js`, `manifest.webmanifest`, `assets/` icons.
- **New tooling**: `package.json`, `vite.config.ts`, `tsconfig.json`; dev dependencies only — shipped runtime requires no Node.js.
- **Deployment**: Static output deployable to GitHub Pages under `/wator/ox_alpha/`.
- **Dependencies**: Phaser 4.x at runtime via CDN (`https://cdnjs.cloudflare.com/ajax/libs/phaser/4.2.1/phaser.min.js`); Phaser types as devDependency only.
