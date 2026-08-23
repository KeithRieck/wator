import type { WatorSimulation } from './WatorSimulation';

/** The kinds of creatures that can inhabit the Wa-Tor world. */
export type EntityType = 'fish' | 'shark';

/** A grid coordinate pair. */
export interface Point {
  /** Column index (0-based, wraps toroidally). */
  readonly x: number;
  /** Row index (0-based, wraps toroidally). */
  readonly y: number;
}

/**
 * Abstract base class for every creature in the Wa-Tor world.
 *
 * An Entity owns its identity (unique id), position, and breeding age.
 * Subclasses implement {@link Entity.act} to express their chronon
 * behavior; the simulation supplies neighbor queries and state mutations
 * so entities never touch the grid storage directly.
 */
export abstract class Entity {
  /** Unique identifier assigned by the simulation registry. */
  public readonly id: number;

  /** Current column position on the toroidal grid. */
  public x: number;

  /** Current row position on the toroidal grid. */
  public y: number;

  /** Number of chronons survived since birth or last reproduction. */
  public breedAge: number = 0;

  /**
   * True while the entity is barred from acting because it was born during
   * the current chronon; cleared by the simulation at chronon end.
   */
  public bornThisChronon: boolean = false;

  /** False once the entity has died or been eaten; dead entities are skipped. */
  public alive: boolean = true;

  /**
   * Creates an entity at the given grid position.
   *
   * @param id - Unique identifier from the simulation registry.
   * @param x - Initial column position.
   * @param y - Initial row position.
   */
  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  /** The discriminator for this entity's concrete type. */
  public abstract get type(): EntityType;

  /**
   * Performs this entity's action for one chronon.
   *
   * Implementations query the simulation for neighbors and request moves,
   * births, or deaths through its primitives.
   *
   * @param sim - The owning simulation providing queries and mutations.
   */
  public abstract act(sim: WatorSimulation): void;
}
