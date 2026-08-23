## Purpose

Defines the Phaser-native user interface for the Wa-Tor app: full-window layout of stats, world view, controls, and history chart; speed and action control behavior; run/pause/step/reset semantics; status display; creature rendering; and responsive reflow.

## ADDED Requirements

### Requirement: 1. Full-window Phaser ownership
The system SHALL render and control the entire app window through Phaser-native scene rendering and input, with no HTML or DOM controls layered over Phaser.

#### Scenario: 1. No DOM overlay
- **WHEN** the app is running
- **THEN** all visible UI (stats, world, controls, chart) is drawn by Phaser scenes

### Requirement: 2. World rendering
The system SHALL draw empty water as the background and draw fish as green circles and sharks as blue circles slightly larger than fish, with no grid lines. Rendering SHALL use Phaser `Graphics` drawing rather than per-cell sprites. When the world advances by one or more chronons, the system SHALL render immediate state updates without per-cell movement animation.

#### Scenario: 1. Creature depiction
- **WHEN** the world is rendered
- **THEN** fish appear as green circles and sharks as slightly larger blue circles on a water background with no grid lines

#### Scenario: 2. Immediate updates
- **WHEN** a chronon completes
- **THEN** the new state is drawn immediately with no movement interpolation

### Requirement: 3. Layout regions
On a wide browser window, the system SHALL lay out stats on the left (Chronon, Fish, Sharks, Status), the world in the center, and controls on the right. The population history chart SHALL render horizontally across the bottom of the window.

#### Scenario: 1. Wide layout
- **WHEN** the app is viewed in a wide browser window
- **THEN** stats appear left of the world, controls right of it, and the history chart spans the bottom

### Requirement: 4. Responsive reflow
When a browser resize occurs, the system SHALL recompute layout and rendering scale without changing the simulation grid dimensions. On a tablet or narrow window, the system SHALL reflow the display while preserving the world aspect ratio and keeping all controls usable.

#### Scenario: 1. Resize preserves grid
- **WHEN** the browser window is resized
- **THEN** the simulation grid dimensions stay unchanged while display scale and layout adjust

#### Scenario: 2. Narrow viewport usability
- **WHEN** the app is viewed at tablet width (`744 x 1133` CSS pixels)
- **THEN** the world keeps its aspect ratio and all controls remain usable

### Requirement: 5. Speed controls
The system SHALL show `1x`, `5x`, `10x`, `30x`, and `60x` buttons in one horizontal row, where each value denotes chronons per second directly. The default speed SHALL be `10x`. While running, speed changes SHALL take effect during subsequent updates; while paused, speed changes SHALL NOT resume the simulation.

#### Scenario: 1. Speed row present
- **WHEN** the controls render
- **THEN** exactly five speed buttons (`1x`, `5x`, `10x`, `30x`, `60x`) appear in one horizontal row

#### Scenario: 2. Live speed change
- **WHEN** a different speed button is pressed while running
- **THEN** subsequent chronons advance at the newly selected rate

#### Scenario: 3. Paused speed change does not resume
- **WHEN** a speed button is pressed while paused
- **THEN** the selection updates but the simulation stays paused

### Requirement: 6. Action controls
The system SHALL show only Play/Pause, Step, and Reset action buttons, each on its own row. While running, Step SHALL be disabled. While paused, Step SHALL advance exactly one chronon. When Reset is activated, the system SHALL create a new random world, set chronon to `0`, clear extinction status, clear population history, and resume running at the selected speed.

#### Scenario: 1. Step disabled while running
- **WHEN** the simulation is running
- **THEN** the Step button is disabled

#### Scenario: 2. Single step while paused
- **WHEN** Step is activated while paused
- **THEN** exactly one chronon elapses and the simulation remains paused

#### Scenario: 3. Reset starts fresh
- **WHEN** Reset is activated
- **THEN** a new random world begins at chronon `0` with cleared history and no terminal status, running at the selected speed

### Requirement: 7. Launch behavior
When the app launches, the system SHALL start directly in a running Wa-Tor simulation at `10x` speed with no landing page or instruction screen.

#### Scenario: 1. Immediate start
- **WHEN** the app finishes loading
- **THEN** the simulation is already running at `10x` with no intermediate screens

### Requirement: 8. Status display
While the simulation is not terminal, the system SHALL display `Running` when running and `Paused` when paused. While terminal, the system SHALL keep Play disabled and require Reset to start another run.

#### Scenario: 1. Non-terminal statuses
- **WHEN** the simulation is not in a terminal state
- **THEN** the status shows `Running` or `Paused` matching the current mode

#### Scenario: 2. Terminal locks Play
- **WHEN** an extinction status is displayed
- **THEN** Play is disabled until Reset is used

### Requirement: 9. Population history chart
The system SHALL draw fish and shark population lines from the rolling history using the same green and blue colors as the world and stats, omitting chart titles and text labels.

#### Scenario: 1. Chart lines match world colors
- **WHEN** the history chart renders
- **THEN** fish populations use green and shark populations use blue, with no titles or labels drawn
