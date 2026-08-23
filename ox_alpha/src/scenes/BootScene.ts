import { getPhaser } from '../phaser';
import { WatorSimulation } from '../simulation/WatorSimulation';
import { setSimulation } from './simulation-holder';

/**
 * Boot scene: creates the simulation world, stores it in the module-level
 * holder, and hands control to the SimulationScene. Keeps all engine
 * construction out of the render scene.
 */
export class BootScene extends getPhaser().Scene {
  /**
   * Creates the boot scene.
   */
  public constructor() {
    super('BootScene');
  }

  /**
   * Creates the simulation and starts the main scene with it.
   */
  public create(): void {
    setSimulation(new WatorSimulation());
    this.scene.start('SimulationScene');
  }
}
