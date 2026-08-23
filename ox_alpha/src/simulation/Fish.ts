import { CONFIG } from '../config';
import { Entity, type Point } from './Entity';
import type { WatorSimulation } from './WatorSimulation';

/**
 * A Wa-Tor fish: moves to a random adjacent empty cell each chronon and,
 * once breeding-ready, leaves a newborn behind in its old cell when it
 * successfully moves.
 */
export class Fish extends Entity {
  /** Chronons a fish must survive before it may reproduce (from config). */
  private static readonly BREED_TIME = CONFIG.fishBreedTime;

  /** @inheritdoc */
 public get type(): 'fish' {
    return 'fish';
  }

  /**
   * Executes the fish chronon rules: move if possible, then reproduce on
   * a successful move when breeding-ready, or reset/continue the breed
   * timer when blocked, per wator-simulation Requirement 4.
   *
   * @param sim - The owning simulation providing queries and mutations.
   */
  public act(sim: WatorSimulation): void {
    const empties: readonly Point[] = sim.emptyNeighbors(this.x, this.y);
    if (empties.length === 0) {
      // Blocked: breeding-ready fish reset their timer; young fish keep aging.
      if (this.breedAge >= Fish.BREED_TIME) {
        this.breedAge = 0;
      }
      return;
    }

    const target: Point = empties[Math.floor(Math.random() * empties.length)]!;
    const oldX: number = this.x;
    const oldY: number = this.y;
    sim.moveEntity(this, target.x, target.y);

    if (this.breedAge >= Fish.BREED_TIME) {
      this.breedAge = 0;
      sim.spawnNewbornAt('fish', oldX, oldY);
    } else {
      this.breedAge += 1;
    }
  }
}
