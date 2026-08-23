# Product Requirements Document for Wa-Tor Phaser Web App
## Context
The project is a browser-based [Wa-Tor](https://en.wikipedia.org/wiki/Wa-Tor) simulation implemented in Typescript, but deployed as a static ES2020 JavaScript web app. Phaser version 4.x is used to own the entire browser window and render the simulation, controls, statistics, and population history chart. The simulation engine itself is framework-independent and must not depend on Phaser.

Wa-Tor is a predator-prey cellular automaton on a toroidal water world. Fish and sharks move orthogonally across a rectangular grid, reproduce over time, and sharks hunt fish while managing starvation energy.

### Background
Time passes in discrete jumps, which I shall call chronons. During each chronon a fish or shark may move north, east, south or west to an adjacent point. A fish may move only to an adjacent unoccupied point. A shark first selects an adjacent point occupied by a fish, moves there, and devours the fish; if no fish are adjacent, the shark may move only to an adjacent unoccupied point. A random-number generator makes the actual choice when more than one valid destination exists. If no valid destination exists, no movement takes place.

#### Rules for Fish:
1. At each chronon, a fish moves randomly to one of the adjacent unoccupied squares. If there are no free squares, no movement takes place.
2. Once a fish has survived a certain number of chronons it may reproduce. This is done as it moves to a neighbouring square, leaving behind a new fish in its old position. Its reproduction time is also reset to zero.

#### Rules for Sharks:
1. At each chronon, a shark moves randomly to an adjacent square occupied by a fish. If there is none, the shark moves to a random adjacent unoccupied square. If there are no free squares, no movement takes place.
2. At each chronon, each shark is deprived of a unit of energy.
3. Upon reaching zero energy, a shark dies.
4. If a shark moves to a square occupied by a fish, it eats the fish and earns a certain amount of energy.
Once a shark has survived a certain number of chronons it may reproduce in exactly the same way as the fish.

## Goals
- Emphasize simulation correctness while keeping the app user-friendly.
- Render a fixed default `100 x 70` grid that remains easy to change in code.
- Keep simulation constants easy for programmers to modify.
- Use Phaser-native rendering and input for the full app window.
- Provide immediate visual updates per chronon, with no movement animation.
- Include pause/play, single-step, reset, and speed controls.
- Show live population stats and a rolling population history chart.
- Keep the app static-site friendly with no backend, and lightweight PWA support.

## Non-Goals
- No user-facing controls for grid dimensions, densities, breeding values, or shark energy values.
- No seeded random number support.
- No HTML or DOM controls layered over Phaser.
- No keyboard shortcuts.
- No world editing, painting, dragging, zooming, or cell inspection.
- No debug console API or hidden runtime debug hooks.
- No creature sprite art, grid lines, movement interpolation, or title/label text on the history chart.

## Actors
- Primary user: a web browser user observing and controlling a Wa-Tor simulation.
- Programmer: a maintainer changing constants, grid dimensions, or implementation details in code.

## Assumptions & Constraints
- Phaser version 4 loads from a CDN script tag in `index.html`.
- JavaScript uses ES2020 modules.
- The shipped runtime has no required Node.js dependency.
- The app is deployable as a static site, including from a repository subpath.
- PWA support is lightweight and best-effort because Phaser loads from a CDN.
    - An acceptable Phaser download site is:  https://cdnjs.cloudflare.com/ajax/libs/phaser/4.2.1/phaser.min.js
    - Assume the minimum tablet CSS viewport dimensions are for an iPad mini: `744 x 1133` CSS pixels.
    - Icon design should show circles suggesting the shark and fish symbols.
- Initial randomness uses `Math.random()`.
- Default grid dimensions are `100 x 70`.
- Default fish density is `30%`.
- Default shark density is `5%`.
- Default `fishBreedTime` is `3` chronons.
- Default `sharkBreedTime` is `25` chronons.
- Default `initialSharkEnergy` is `5`.
- Default `sharkEnergyGain` is `3`.
- Default `sharkEnergyCostPerChronon` is `1`.
- Default speed is `10x`, which means 10 chronons per second.
- Supported speed choices are `1x`, `5x`, `10x`, `30x`, and `60x`.
- Fish are green circles.
- Sharks are blue circles and slightly larger than fish.
- Phaser Sprites are not used. All rendering uses Phaser `Graphics` drawing.
- Each class has a JSDoc documentation comment.
- Each static method and each public method longer than 8 lines has a JSDoc documentation comment.

## Acceptance Criteria
1. WHEN the app launches, THEN the system SHALL start directly in a running Wa-Tor simulation at `10x` speed with no landing page or instruction screen.
2. WHERE the project files are organized, THEN the system SHALL include `index.html`, `src/main.ts`, `src/config.ts`, `src/simulation/WatorSimulation.ts`, `src/scenes/BootScene.ts`, `src/scenes/SimulationScene.ts`, `sw.js`, `manifest.webmanifest`, and an `assets/` directory for PWA assets.  There may be a `src/ui` directory for on-screen elements and UI helper classes.
3. WHEN `index.html` loads the app, THEN the system SHALL load Phaser version 4.x from a CDN script tag and SHALL load the app through ES2020 JavaScript modules.
4. WHERE the simulation engine is implemented, THEN the system SHALL keep all Wa-Tor rules independent from Phaser APIs and Phaser scene objects.
5. WHERE Phaser is used, THEN the system SHALL render and control the entire app window through Phaser-native scene rendering and input.
6. WHEN the simulation initializes, THEN the system SHALL create a rectangular toroidal grid using code constants for width and height with defaults of `100` columns and `70` rows.
7. WHEN the simulation initializes, THEN the system SHALL randomly populate the grid using code constants for `30%` fish density and `5%` shark density.
8. WHEN a programmer changes grid dimension constants in code, THEN the system SHALL gracefully scale and center the world display without requiring UI changes.
9. WHEN a browser resize occurs, THEN the system SHALL recompute layout and rendering scale without changing the simulation grid dimensions.
10. WHERE movement is evaluated, THEN the system SHALL consider only orthogonal neighbors north, east, south, and west with toroidal edge wrapping.
11. WHEN a chronon starts, THEN the system SHALL collect current entity IDs, randomize their order, and allow each surviving entity to act at most once.
12. IF an entity was born during the current chronon, THEN the system SHALL prevent that entity from acting until the next chronon.
13. IF an entity dies or is eaten before its randomized turn, THEN the system SHALL skip that entity when its turn is reached.
14. WHEN a fish acts and at least one adjacent empty cell exists, THEN the system SHALL move the fish to a randomly selected adjacent empty cell.
15. IF a fish is breeding-ready and successfully moves, THEN the system SHALL leave a new fish in the old cell and reset the parent fish breed timer to `0`.
16. IF a fish is breeding-ready and cannot move, THEN the system SHALL reset the fish breed timer to `0`.
17. IF a fish is not breeding-ready and cannot move, THEN the system SHALL continue aging the fish breed timer.
18. WHEN a shark acts, THEN the system SHALL decrement shark energy by `sharkEnergyCostPerChronon` before movement or eating.
19. IF a shark energy value reaches `0` after the start-of-action decrement, THEN the system SHALL remove the shark immediately without moving or eating.
20. IF a shark has adjacent fish after surviving the energy decrement, THEN the system SHALL move the shark to a randomly selected adjacent fish cell and remove the eaten fish.
21. WHEN a shark eats a fish, THEN the system SHALL add `sharkEnergyGain` to the shark energy.
22. IF a shark has no adjacent fish and has at least one adjacent empty cell, THEN the system SHALL move the shark to a randomly selected adjacent empty cell.
23. IF a shark is breeding-ready and successfully moves, THEN the system SHALL leave a newborn shark in the old cell and reset the parent shark breed timer to `0`.
24. WHEN a newborn shark is created, THEN the system SHALL initialize the newborn shark energy to `initialSharkEnergy`.
25. IF a shark is breeding-ready and cannot move, THEN the system SHALL reset the shark breed timer to `0`.
26. IF a shark is not breeding-ready and cannot move, THEN the system SHALL continue aging the shark breed timer.
27. WHERE simulation state is stored, THEN the system SHALL use a flat grid array plus entity records containing ID, type, position, breed age, and shark energy when applicable.
28. WHEN the world is rendered, THEN the system SHALL draw empty water as the background and draw fish and sharks as abstract circles with no grid lines.
29. WHEN the world advances by one or more chronons, THEN the system SHALL render immediate state updates without per-cell movement animation.
30. WHERE population stats appear, THEN the system SHALL place Chronon, Fish, Sharks, and Status on the left side of the main world display.
31. WHERE controls appear, THEN the system SHALL place controls on the right side of the main world display.
32. WHERE speed controls appear, THEN the system SHALL show `1x`, `5x`, `10x`, `30x`, and `60x` buttons in one horizontal row.
33. WHERE action controls appear, THEN the system SHALL show only Play/Pause, Step, and Reset with each action button on its own row.
34. WHILE the simulation is running, THEN the system SHALL disable Step and allow speed changes to take effect during subsequent updates.
35. WHILE the simulation is paused, THEN the system SHALL allow Step to advance exactly one chronon and SHALL keep selected speed changes from resuming the simulation.
36. WHEN Reset is activated, THEN the system SHALL create a new random world, set chronon to `0`, clear extinction status, clear population history, and resume running at the selected speed.
37. IF either fish or sharks become extinct, THEN the system SHALL auto-pause the simulation and display a terminal status.
38. IF sharks reach zero while fish remain, THEN the system SHALL display `Sharks extinct`.
39. IF fish reach zero while sharks remain, THEN the system SHALL display `Fish extinct`.
40. IF fish and sharks both reach zero in the same chronon, THEN the system SHALL display `Ecosystem collapsed`.
41. WHILE the simulation is not terminal and running, THEN the system SHALL display `Running`.
42. WHILE the simulation is not terminal and paused, THEN the system SHALL display `Paused`.
43. WHILE the simulation is terminal, THEN the system SHALL keep Play disabled and SHALL require Reset to start another run.
44. WHERE the population history chart appears, THEN the system SHALL render it horizontally across the bottom of the window.
45. WHEN population history is recorded, THEN the system SHALL store one sample per chronon for a rolling window of `500` chronons.
46. WHERE the population history chart is rendered, THEN the system SHALL draw fish and shark population lines using the same green and blue colors as the world and stats.
47. WHERE the population history chart is rendered, THEN the system SHALL omit chart titles and text labels.
48. WHEN Phaser update frames occur, THEN the system SHALL advance the simulation according to the selected chronons-per-second speed as normally as the browser allows.
49. IF the browser tab is hidden or throttled, THEN the system SHALL not implement special real-time preservation or catch-up compensation behavior.
50. WHERE rendering is implemented, THEN the system SHALL use Phaser `Graphics` drawing rather than per-cell sprites.
51. WHEN the app is viewed on a wide browser window, THEN the system SHALL lay out stats on the left, world in the center, controls on the right, and the history chart across the bottom.
52. WHEN the app is viewed on a tablet or narrow browser window, THEN the system SHALL reflow the display while preserving the world aspect ratio and keeping all controls usable.
53. WHERE code constants define model parameters, THEN the system SHALL make grid dimensions, densities, breed times, shark energy values, colors, and speed options easy for programmers to change.
54. WHERE code documentation is written, THEN the system SHALL use JSDoc-style comments for every class.
55. WHERE static methods and public methods exceed 8 lines, THEN the system SHALL document them with JSDoc-style comments.
56. WHERE PWA support is implemented, THEN the system SHALL include a manifest and service worker that cache the app shell and same-origin assets.
57. IF the CDN Phaser script has not already been successfully loaded and cached, THEN the system SHALL allow first-load or offline behavior to depend on network availability.  

## Risks / Trade-offs
- Phaser CDN loading keeps the app simple but limits guaranteed offline behavior.
- Fixed UI constants simplify v1 but require code edits for model experimentation.
- Phaser-native UI avoids DOM overlays but requires custom button, layout, and chart handling.
- Using `Math.random()` simplifies implementation but prevents reproducible runs.
- No special catch-up behavior makes browser throttling behavior acceptable but not time-accurate.

## Open Questions

## Known Gaps
- The spec does not define exact pixel sizes, fonts, or spacing for Phaser-native UI.
- The spec does not define a manual verification checklist.
- The spec does not include OpenSpec proposal, design, or task artifacts.
