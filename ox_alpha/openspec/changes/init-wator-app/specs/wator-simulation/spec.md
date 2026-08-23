## Purpose

Defines the Wa-Tor predator-prey simulation engine: grid setup, chronon processing rules for fish and sharks, reproduction, shark energy and starvation, extinction detection, and population history sampling. The engine behaves identically regardless of presentation layer.

## ADDED Requirements

### Requirement: 1. Toroidal grid initialization
The system SHALL create a rectangular toroidal grid using code constants for width and height with defaults of `100` columns and `70` rows. Movement evaluation SHALL consider only orthogonal neighbors north, east, south, and west, wrapping across edges.

#### Scenario: 1. Default grid dimensions
- **WHEN** the simulation initializes with default constants
- **THEN** the grid has exactly `100` columns and `70` rows

#### Scenario: 2. Toroidal wrapping at edges
- **WHEN** an entity at a grid edge considers its orthogonal neighbors
- **THEN** neighbors wrap to the opposite edge (e.g., the west neighbor of column `0` is column `width - 1`)

### Requirement: 2. Random initial population
The system SHALL randomly populate the grid using code constants for `30%` fish density and `5%` shark density, with no cell holding more than one entity.

#### Scenario: 1. Initial densities
- **WHEN** a new world is created with defaults on a `100 x 70` grid
- **THEN** approximately `30%` of cells contain fish and approximately `5%` contain sharks

#### Scenario: 2. No overlapping entities
- **WHEN** initial population completes
- **THEN** every cell contains at most one entity

### Requirement: 3. Chronon turn order
At each chronon start, the system SHALL collect current entity IDs, randomize their order, and allow each surviving entity to act at most once. An entity born during the current chronon SHALL NOT act until the next chronon. An entity that dies or is eaten before its randomized turn SHALL be skipped when its turn is reached.

#### Scenario: 1. Each entity acts at most once
- **WHEN** a chronon is processed
- **THEN** every entity alive at chronon start acts exactly once, in random order

#### Scenario: 2. Newborn deferral
- **WHEN** an entity is born during a chronon
- **THEN** it does not act during that chronon but may act from the next chronon onward

#### Scenario: 3. Eaten entity skipped
- **WHEN** a fish is eaten by a shark earlier in the same chronon's randomized order
- **THEN** the fish performs no action when its turn is reached

### Requirement: 4. Fish movement and reproduction
When a fish acts and at least one adjacent empty cell exists, the system SHALL move the fish to a randomly selected adjacent empty cell. If the fish is breeding-ready and successfully moves, the system SHALL leave a new fish in the old cell and reset the parent breed timer to `0`. If the fish is breeding-ready and cannot move, the system SHALL reset its breed timer to `0`. If the fish is not breeding-ready and cannot move, the system SHALL continue aging its breed timer.

#### Scenario: 1. Fish moves to empty cell
- **WHEN** a fish acts with at least one adjacent empty cell
- **THEN** it occupies one of those cells chosen at random

#### Scenario: 2. Breeding-ready fish reproduces on move
- **WHEN** a breeding-ready fish successfully moves
- **THEN** a newborn fish remains in the old cell and the parent's breed timer resets to `0`

#### Scenario: 3. Blocked breeding-ready fish resets timer
- **WHEN** a breeding-ready fish has no adjacent empty cell
- **THEN** its breed timer resets to `0` without movement or reproduction

#### Scenario: 4. Blocked young fish keeps aging
- **WHEN** a fish below breeding age has no adjacent empty cell
- **THEN** its breed timer continues to increase

### Requirement: 5. Shark energy, hunting, and reproduction
When a shark acts, the system SHALL decrement its energy by `sharkEnergyCostPerChronon` before any movement or eating. If energy reaches `0`, the system SHALL remove the shark immediately without moving or eating. If adjacent fish exist after surviving the decrement, the system SHALL move the shark to a randomly selected adjacent fish cell, remove the eaten fish, and add `sharkEnergyGain` to the shark energy. Otherwise, if an adjacent empty cell exists, the shark SHALL move there. If a breeding-ready shark successfully moves, the system SHALL leave a newborn shark in the old cell with energy initialized to `initialSharkEnergy` and reset the parent breed timer to `0`. If a breeding-ready shark cannot move, the system SHALL reset its breed timer to `0`. If a shark is not breeding-ready and cannot move, the system SHALL continue aging its breed timer.

#### Scenario: 1. Energy decrements first
- **WHEN** a shark acts
- **THEN** its energy decreases by `sharkEnergyCostPerChronon` before any movement or eating occurs

#### Scenario: 2. Starvation death precedes action
- **WHEN** a shark's energy reaches `0` after the start-of-action decrement
- **THEN** the shark is removed immediately without moving or eating

#### Scenario: 3. Hunt eats adjacent fish
- **WHEN** a surviving shark has at least one adjacent fish
- **THEN** it moves onto one at random, removes the eaten fish, and gains `sharkEnergyGain` energy

#### Scenario: 4. Move to empty when no prey
- **WHEN** a shark has no adjacent fish but at least one adjacent empty cell
- **THEN** it moves to one of those cells chosen at random

#### Scenario: 5. Breeding-ready shark reproduces on move
- **WHEN** a breeding-ready shark successfully moves
- **THEN** a newborn shark with energy `initialSharkEnergy` remains in the old cell and the parent's breed timer resets to `0`

#### Scenario: 6. Blocked shark breed timer rules
- **WHEN** a shark cannot move
- **THEN** its breed timer resets to `0` if breeding-ready, otherwise continues aging

### Requirement: 6. Simulation state model
The system SHALL store simulation state as a flat grid array plus entity records containing ID, type, position, breed age, and shark energy where applicable.

#### Scenario: 1. State completeness
- **WHEN** any entity exists in the simulation
- **THEN** its record exposes identity, type, position, breed age, and (for sharks) energy

### Requirement: 7. Extinction detection
If either fish or sharks become extinct, the system SHALL auto-pause the simulation and report a terminal status: `Sharks extinct` when sharks reach zero while fish remain, `Fish extinct` when fish reach zero while sharks remain, and `Ecosystem collapsed` when both reach zero in the same chronon.

#### Scenario: 1. Sharks die out
- **WHEN** the shark population reaches zero while fish remain
- **THEN** the simulation pauses and reports `Sharks extinct`

#### Scenario: 2. Fish die out
- **WHEN** the fish population reaches zero while sharks remain
- **THEN** the simulation pauses and reports `Fish extinct`

#### Scenario: 3. Simultaneous collapse
- **WHEN** fish and sharks both reach zero in the same chronon
- **THEN** the simulation pauses and reports `Ecosystem collapsed`

### Requirement: 8. Population history sampling
The system SHALL store one sample of fish and shark populations per chronon for a rolling window of `500` chronons.

#### Scenario: 1. One sample per chronon
- **WHEN** a chronon completes
- **THEN** the fish and shark populations are recorded as one history sample

#### Scenario: 2. Rolling window bound
- **WHEN** more than `500` chronons have completed
- **THEN** the history retains only the most recent `500` samples
