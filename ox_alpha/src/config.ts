/**
 * Central configuration constants for the Wa-Tor simulation.
 *
 * Every model parameter a programmer may tune lives here: grid dimensions,
 * population densities, breeding times, shark energy values, render colors,
 * and speed options. Changing a value in this file changes app behavior
 * without edits anywhere else.
 */

/** Grid and world layout settings. */
export interface GridConfig {
  /** Number of grid columns (world width in cells). */
  readonly width: number;
  /** Number of grid rows (world height in cells). */
  readonly height: number;
}

/** Initial population densities as fractions of total cells. */
export interface DensityConfig {
  /** Fraction of cells initially holding fish (0..1). */
  readonly fish: number;
  /** Fraction of cells initially holding sharks (0..1). */
  readonly shark: number;
}

/** Shark energy model settings. */
export interface SharkEnergyConfig {
  /** Energy of every newborn or initially placed shark. */
  readonly initialSharkEnergy: number;
  /** Energy gained by a shark when it eats a fish. */
  readonly sharkEnergyGain: number;
  /** Energy subtracted from each shark at the start of its action. */
  readonly sharkEnergyCostPerChronon: number;
}

/** Rendering colors used for creatures, water, and chart lines. */
export interface ColorConfig {
  /** Fish body color. */
  readonly fish: number;
  /** Shark body color. */
  readonly shark: number;
  /** Empty water background color. */
  readonly water: number;
}

/** One selectable simulation speed. */
export interface SpeedOption {
  /** Button label suffix value, e.g. 10 for "10x". */
  readonly multiplier: number;
  /** Chronons advanced per second at this speed. */
  readonly chrononsPerSecond: number;
}

/** The complete set of tunable Wa-Tor parameters. */
export const CONFIG = {
  /** World grid dimensions; defaults to the classic 100 x 70 torus. */
  grid: {
    width: 100,
    height: 70
  } satisfies GridConfig as GridConfig,

  /** Initial fish and shark densities. */
  density: {
    fish: 0.30,
    shark: 0.05
  } satisfies DensityConfig as DensityConfig,

  /** Chronons a fish must survive before it can reproduce. */
  fishBreedTime: 3,

  /** Chronons a shark must survive before it can reproduce. */
  sharkBreedTime: 25,

  /** Shark energy model values. */
  sharkEnergy: {
    initialSharkEnergy: 5,
    sharkEnergyGain: 3,
    sharkEnergyCostPerChronon: 1
  } satisfies SharkEnergyConfig as SharkEnergyConfig,

  /** Render colors for creatures and water. */
  colors: {
    fish: 0x2ecc71,
    shark: 0x3498db,
    water: 0x0a3d62
  } satisfies ColorConfig as ColorConfig,

  /**
   * Supported speeds; each multiplier denotes chronons per second directly
   * (10x means 10 chronons per second).
   */
  speeds: [
    { multiplier: 1, chrononsPerSecond: 1 },
    { multiplier: 5, chrononsPerSecond: 5 },
    { multiplier: 10, chrononsPerSecond: 10 },
    { multiplier: 30, chrononsPerSecond: 30 },
    { multiplier: 60, chrononsPerSecond: 60 }
  ] satisfies SpeedOption[] as SpeedOption[],

  /** Index into {@link CONFIG.speeds} used when the app launches. */
  defaultSpeedIndex: 2,

  /** Number of chronons retained in the rolling population history window. */
  historyWindow: 500,

  /** Relative radius of a fish circle compared to one rendered cell. */
  fishRadiusFactor: 0.38,

  /** Relative radius of a shark circle compared to one rendered cell. */
  sharkRadiusFactor: 0.48
} as const;
