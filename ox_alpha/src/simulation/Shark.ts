import { CONFIG } from '../config';
import { Entity, type Point } from './Entity';
import type { WatorSimulation } from './WatorSimulation';

/**
 * A Wa-Tor shark: spends energy each chronon (dying at zero before acting
 * further), hunts adjacent fish for energy gain, otherwise drifts to an
 * empty cell, and reproduces on a successful move when breeding-ready.
 */
export class Shark extends Entity {
  /** Chronons a shark must survive before it may reproduce (from config). */
  private static readonly BREED_TIME = CONFIG.sharkBreedTime;

  /** Current energy; the shark dies when it reaches zero. */
  public energy: number;

  /**
   * Creates a shark whose energy starts at the configured initial value.
   *
   * @param id - Unique identifier from the simulation registry.
   * @param x - Initial column position.
   * @param y - Initial row position.
   * @param energy - Starting energy; defaults to the configured initial
   *                 shark energy (newborns and seeded sharks both use it).
   */
  public constructor(id: number, x: number, y: number, energy: number = CONFIG.sharkEnergy.initialSharkEnergy) {
    super(id, x, y);
    this.energy = energy;
  }

  /** @inheritdoc */
  public get type(): 'shark' {
    return 'shark';
  }

  /**
   * Executes the shark chronon rules per wator-simulation Requirement 5:
   * decrement energy first, die at zero without moving or eating, then
   * hunt an adjacent fish, else move to an empty cell, handling breeding
   * on successful moves and timer reset/aging when blocked.
   *
   * @param sim - The owning simulation providing queries and mutations.
   */
  public act(sim: WatorSimulation): void {
    this.energy -= CONFIG.sharkEnergy.sharkEnergyCostPerChronon;
    if (this.energy <= 0) {
      sim.removeEntity(this);
      return;
    }

    const prey: readonly Point[] = sim.fishNeighbors(this.x, this.y);
    if (prey.length > 0) {
      const target: Point = prey[Math.floor(Math.random() * prey.length)]!;
      const eaten: Entity | null = sim.entityAt(target.x, target.y);
      const oldX: number = this.x;
      const oldY: number = this.y;
      sim.moveEntity(this, target.x, target.y);
      if (eaten !== null) {
        sim.removeEntity(eaten);
      }
      this.energy += CONFIG.sharkEnergy.sharkEnergyGain;
      this.reproduceOrAge(sim, oldX, oldY);
      return;
    }

    const empties: readonly Point[] = sim.emptyNeighbors(this.x, this.y);
    if (empties.length === 0) {
      // Blocked: breeding-ready sharks reset their timer; young sharks keep aging.
      if (this.breedAge >= Shark.BREED_TIME) {
        this.breedAge = 0;
      }
      return;
    }

    const target: Point = empties[Math.floor(Math.random() * empties.length)]!;
    const oldX: number = this.x;
    const oldY: number = this.y;
    sim.moveEntity(this, target.x, target.y);
    this.reproduceOrAge(sim, oldX, oldY);
  }

  /**
   * Handles post-move breeding: leaves a newborn shark in the parent's old
   * cell and resets the breed timer when ready, otherwise ages the timer.
   *
   * @param sim - The owning simulation providing spawn primitives.
   * @param oldX - The parent's column before the move.
   * @param oldY - The parent's row before the move.
   */
  private reproduceOrAge(sim: WatorSimulation, oldX: number, oldY: number): void {
    if (this.breedAge >= Shark.BREED_TIME) {
      this.breedAge = 0;
      sim.spawnNewbornAt('shark', oldX, oldY);
    } else {
      this.breedAge += 1;
    }
  }
}
