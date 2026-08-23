import type { WatorSimulation } from '../simulation/WatorSimulation';

/**
 * Module-level holder for the simulation instance shared between scenes.
 *
 * Phaser 4 scene registries are per-scene, so a module singleton is the
 * simplest reliable way to hand the engine from BootScene to SimulationScene.
 */
let simulation: WatorSimulation | null = null;

/**
 * Stores the active simulation instance.
 *
 * @param value - The simulation created by BootScene.
 */
export function setSimulation(value: WatorSimulation): void {
  simulation = value;
}

/**
 * Retrieves the active simulation instance.
 *
 * @returns The simulation, or null before BootScene has run.
 */
export function getSimulation(): WatorSimulation | null {
  return simulation;
}
