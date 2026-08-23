import { CONFIG } from '../config';
import { Entity, type EntityType, type Point } from './Entity';
import { Fish } from './Fish';
import { Shark } from './Shark';

/** Terminal ecosystem states reported once a species dies out. */
export type SimulationStatus =
  | 'Running'
  | 'Paused'
  | 'Sharks extinct'
  | 'Fish extinct'
  | 'Ecosystem collapsed';

/** One recorded sample of fish and shark populations for the history chart. */
export interface PopulationSample {
  /** Chronon index at which the sample was taken. */
  readonly chronon: number;
  /** Number of living fish. */
  readonly fish: number;
  /** Number of living sharks. */
  readonly sharks: number;
}

/**
 * The framework-independent Wa-Tor engine.
 *
 * Owns the flat toroidal grid and the entity registry, implements the
 * chronon loop (randomized order, newborn deferral, dead-entity skipping),
 * extinction detection, and rolling population history. Contains no
 * Phaser references so it can be exercised in any JavaScript runtime.
 */
export class WatorSimulation {
  /** Grid columns; constant for the life of this world. */
  public readonly width: number;

  /** Grid rows; constant for the life of this world. */
  public readonly height: number;

  /** Flat grid of cell -> entity (or null); index = y * width + x. */
  private readonly grid: (Entity | null)[];

  /** Registry of all entities by id, including the dead until reaped. */
  private readonly entities: Map<number, Entity> = new Map();

  /** Monotonic id counter for entity registration. */
  private nextId: number = 0;

  /** Number of completed chronons since world creation. */
  private chrononCount: number = 0;

  /** Current terminal or run status. */
  private statusValue: SimulationStatus = 'Running';

  /** Rolling population history, oldest first, capped at the window size. */
  private readonly history: PopulationSample[] = [];

  /**
   * Creates a simulation with a randomly populated toroidal grid.
   *
   * @param width - Grid columns; defaults to the configured width.
   * @param height - Grid rows; defaults to the configured height.
   */
  public constructor(width: number = CONFIG.grid.width, height: number = CONFIG.grid.height) {
    this.width = width;
    this.height = height;
    this.grid = new Array<Entity | null>(width * height).fill(null);
    this.populate();
    this.recordHistory();
  }

  /** The current status: Running, Paused, or a terminal extinction state. */
  public get status(): SimulationStatus {
    return this.statusValue;
  }

  /**
   * Sets a non-terminal status; terminal states are only reached through
   * {@link WatorSimulation.step} extinction evaluation.
   *
   * @param value - The new status; must not be a terminal one.
   */
  public set status(value: SimulationStatus) {
    if (this.isTerminal()) {
      return;
    }
    this.statusValue = value;
  }

  /** Number of completed chronons. */
  public get chronons(): number {
    return this.chrononCount;
  }

  /** Count of living fish. */
  public get fishCount(): number {
    return this.countType('fish');
  }

  /** Count of living sharks. */
  public get sharkCount(): number {
    return this.countType('shark');
  }

  /** The rolling population history samples, oldest first. */
  public get populationHistory(): readonly PopulationSample[] {
    return this.history;
  }

  /** True when an extinction state has been reached. */
  public isTerminal(): boolean {
    return (
      this.statusValue === 'Sharks extinct' ||
      this.statusValue === 'Fish extinct' ||
      this.statusValue === 'Ecosystem collapsed'
    );
  }

  /**
   * Advances the world by exactly one chronon: shuffles surviving entity
   * ids, lets each still-living, non-newborn entity act once, then clears
   * newborn flags, records history, and evaluates extinction.
   */
  public step(): void {
    if (this.isTerminal()) {
      return;
    }

    const ids: number[] = [];
    for (const entity of this.entities.values()) {
      if (entity.alive && !entity.bornThisChronon) {
        ids.push(entity.id);
      }
    }
    this.shuffle(ids);

    for (const id of ids) {
      const entity: Entity | undefined = this.entities.get(id);
      // Skip entities eaten or otherwise removed earlier in this chronon,
      // and newborns created during this chronon.
      if (entity === undefined || !entity.alive || entity.bornThisChronon) {
        continue;
      }
      entity.act(this);
    }

    for (const entity of this.entities.values()) {
      entity.bornThisChronon = false;
    }

    this.chrononCount += 1;
    this.recordHistory();
    this.evaluateExtinction();
  }

  /**
   * Returns the entity occupying a cell, or null when empty.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @returns The occupant, or null if the cell holds no living entity.
   */
  public entityAt(x: number, y: number): Entity | null {
    const occupant: Entity | null = this.grid[y * this.width + x] ?? null;
    if (occupant !== null && !occupant.alive) {
      return null;
    }
    return occupant;
  }

  /**
   * Lists orthogonal neighbor positions with toroidal wrapping.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @returns The north, east, south, west cells in wrapped coordinates.
   */
  public neighbors(x: number, y: number): Point[] {
    const points: Point[] = [];
    const deltas: ReadonlyArray<readonly [number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of deltas) {
      points.push({
        x: (x + dx + this.width) % this.width,
        y: (y + dy + this.height) % this.height
      });
    }
    return points;
  }

  /**
   * Lists adjacent cells that hold no living entity.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @returns Empty neighbor positions in wrap-aware coordinates.
   */
  public emptyNeighbors(x: number, y: number): Point[] {
    return this.neighbors(x, y).filter((p: Point) => this.entityAt(p.x, p.y) === null);
  }

  /**
   * Lists adjacent cells occupied by a living fish.
   *
   * @param x - Column index.
   * @param y - Row index.
   * @returns Neighbor positions containing fish prey.
   */
  public fishNeighbors(x: number, y: number): Point[] {
    return this.neighbors(x, y).filter((p: Point) => {
      const occupant: Entity | null = this.entityAt(p.x, p.y);
      return occupant !== null && occupant.type === 'fish';
    });
  }

  /**
   * Moves a living entity to the given cell, updating both registry and grid.
   * The destination is expected to be empty or to hold prey handled by the caller.
   *
   * @param entity - The entity to relocate.
   * @param x - Destination column.
   * @param y - Destination row.
   */
  public moveEntity(entity: Entity, x: number, y: number): void {
    this.grid[entity.y * this.width + entity.x] = null;
    entity.x = x;
    entity.y = y;
    this.grid[y * this.width + x] = entity;
  }

  /**
   * Spawns a newborn of the given type at a specific cell. Newborns carry
   * the born-this-chronon flag so they do not act until the next chronon.
   *
   * @param type - The kind of creature to spawn.
   * @param x - Birth column.
   * @param y - Birth row.
   */
  public spawnNewbornAt(type: EntityType, x: number, y: number): void {
    if (this.entityAt(x, y) !== null) {
      return;
    }
    const id: number = this.nextId++;
    const newborn: Entity = type === 'fish' ? new Fish(id, x, y) : new Shark(id, x, y);
    newborn.bornThisChronon = true;
    this.entities.set(id, newborn);
    this.grid[y * this.width + x] = newborn;
  }

  /**
   * Marks an entity dead and vacates its cell.
   *
   * @param entity - The entity to remove from the living world.
   */
  public removeEntity(entity: Entity): void {
    entity.alive = false;
    const index: number = entity.y * this.width + entity.x;
    if (this.grid[index] === entity) {
      this.grid[index] = null;
    }
  }

  /** Randomly fills the empty grid with fish and sharks at configured densities. */
  private populate(): void {
    const totalCells: number = this.width * this.height;
    const fishTarget: number = Math.floor(totalCells * CONFIG.density.fish);
    const sharkTarget: number = Math.floor(totalCells * CONFIG.density.shark);

    const indices: number[] = Array.from({ length: totalCells }, (_v, i: number) => i);
    this.shuffle(indices);

    let cursor: number = 0;
    for (let i = 0; i < fishTarget; i++) {
      const index: number = indices[cursor++]!;
      this.spawnSeeded('fish', index % this.width, Math.floor(index / this.width));
    }
    for (let i = 0; i < sharkTarget; i++) {
      const index: number = indices[cursor++]!;
      this.spawnSeeded('shark', index % this.width, Math.floor(index / this.width));
    }
  }

  /**
   * Places an initial (non-newborn) entity directly into the world.
   *
   * @param type - The kind of creature to place.
   * @param x - Placement column.
   * @param y - Placement row.
   */
  private spawnSeeded(type: EntityType, x: number, y: number): void {
    const id: number = this.nextId++;
    const entity: Entity = type === 'fish' ? new Fish(id, x, y) : new Shark(id, x, y);
    this.entities.set(id, entity);
    this.grid[y * this.width + x] = entity;
  }

  /**
   * In-place Fisher–Yates shuffle using Math.random().
   *
   * @param list - The array to randomize.
   */
  private shuffle(list: number[]): void {
    for (let i = list.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      const tmp: number = list[i]!;
      list[i] = list[j]!;
      list[j] = tmp;
    }
  }

  /** Appends the current populations to the rolling history window. */
  private recordHistory(): void {
    this.history.push({ chronon: this.chrononCount, fish: this.fishCount, sharks: this.sharkCount });
    if (this.history.length > CONFIG.historyWindow) {
      this.history.shift();
    }
  }

  /** Evaluates and records terminal extinction states after a chronon. */
  private evaluateExtinction(): void {
    const fish: number = this.fishCount;
    const sharks: number = this.sharkCount;
    if (fish === 0 && sharks === 0) {
      this.statusValue = 'Ecosystem collapsed';
    } else if (sharks === 0) {
      this.statusValue = 'Sharks extinct';
    } else if (fish === 0) {
      this.statusValue = 'Fish extinct';
    }
  }

  /**
   * Counts living entities of one type.
   *
   * @param type - The discriminator to count.
   * @returns Number of living entities matching the type.
   */
  private countType(type: EntityType): number {
    let count: number = 0;
    for (const entity of this.entities.values()) {
      if (entity.alive && entity.type === type) {
        count += 1;
      }
    }
    return count;
  }
}
