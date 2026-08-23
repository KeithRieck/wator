import type * as Phaser from 'phaser';
import { getPhaser } from '../phaser';
import { CONFIG } from '../config';
import { WatorSimulation, type SimulationStatus } from '../simulation/WatorSimulation';
import { getSimulation, setSimulation } from './simulation-holder';
import { computeLayout, fitWorld, type Layout, type Rect } from '../ui/layout';
import PhaserButton from '../ui/PhaserButton';
import { StatsPanel } from '../ui/StatsPanel';
import { HistoryChart } from '../ui/HistoryChart';

/** Fixed pixel size for speed buttons. */
const SPEED_BUTTON_WIDTH = 40;
const SPEED_BUTTON_HEIGHT = 34;

/** Fixed pixel size for action buttons. */
const ACTION_BUTTON_WIDTH = 110;
const ACTION_BUTTON_HEIGHT = 38;

/**
 * Main scene: owns the chronon update loop, world rendering, stats panel,
 * speed/action controls, and the population history chart. Recomputes its
 * layout on resize without touching simulation state.
 */
export class SimulationScene extends getPhaser().Scene {
  /** The simulation engine instance received from BootScene. */
  private simulation!: WatorSimulation;

  /** Graphics object used for the world redraw each frame. */
  private worldGraphics!: Phaser.GameObjects.Graphics;

  /** Current computed layout regions. */
  private layout!: Layout;

  /** Letterboxed world drawing rectangle. */
  private worldRect!: Rect;

  /** Fractional chronon accumulator for the speed loop. */
  private accumulator: number = 0;

  /** Index into CONFIG.speeds for the selected speed. */
  private speedIndex: number = CONFIG.defaultSpeedIndex;

  /** Whether the simulation is running (vs paused). */
  private running: boolean = true;

  /** UI widgets. */
  private statsPanel!: StatsPanel;
  private chart!: HistoryChart;
  private speedButtons: PhaserButton[] = [];
  private playPauseButton!: PhaserButton;
  private stepButton!: PhaserButton;
  private resetButton!: PhaserButton;

  /**
   * Creates the scene.
   */
  public constructor() {
    super('SimulationScene');
  }

  /**
   * Builds graphics objects, retrieves the simulation from the module
   * holder (creating one lazily if this scene starts before BootScene),
   * wires controls and resize handling, and performs the first layout
   * and render.
   */
  public create(): void {
    let simulation = getSimulation();
    if (simulation === null) {
      // Order-independent fallback: guarantee a world exists even if this
      // scene boots before BootScene populates the holder.
      simulation = new WatorSimulation();
      setSimulation(simulation);
    }
    this.simulation = simulation;

    this.worldGraphics = this.add.graphics();
    this.statsPanel = new StatsPanel(this);
    this.chart = new HistoryChart(this);
    this.createControls();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });

    this.relayout();
  }

  /** Last terminal state seen by the update loop, for edge-triggered refresh. */
  private lastTerminal: boolean = false;

  /**
   * Frame update: accumulates elapsed time and advances whole chronons at
   * the selected speed. No catch-up compensation is performed; throttled
   * tabs simply advance more slowly.
   *
   * @param _time - Total elapsed ms (unused).
   * @param delta - Milliseconds since the previous frame.
   */
  public override update(_time: number, delta: number): void {
    if (this.running && !this.simulation.isTerminal()) {
      this.accumulator += delta / 1000;
      const interval: number = 1 / CONFIG.speeds[this.speedIndex]!.chrononsPerSecond;
      while (this.accumulator >= interval) {
        this.simulation.step();
        this.accumulator -= interval;
        if (this.simulation.isTerminal()) {
          this.running = false;
          break;
        }
      }
    }
    // Edge-triggered control refresh so extinction reached via Step (or any
    // path outside this loop) immediately locks Play and Step.
    const terminal: boolean = this.simulation.isTerminal();
    if (terminal !== this.lastTerminal) {
      this.lastTerminal = terminal;
      this.refreshControlStates();
    }
    this.render();
  }

  /**
   * Creates all control buttons: one horizontal speed row plus Play/Pause,
   * Step, and Reset rows.
   */
  private createControls(): void {
    this.speedButtons = CONFIG.speeds.map((option, index: number) => {
      return new PhaserButton(
        this,
        0,
        0,
        SPEED_BUTTON_WIDTH,
        SPEED_BUTTON_HEIGHT,
        `${option.multiplier}x`,
        () => {
          this.speedIndex = index;
          this.refreshControlStates();
        }
      );
    });

    this.playPauseButton = new PhaserButton(
      this,
      0,
      0,
      ACTION_BUTTON_WIDTH,
      ACTION_BUTTON_HEIGHT,
      'Pause',
      () => {
        if (this.simulation.isTerminal()) {
          return;
        }
        this.running = !this.running;
        this.accumulator = 0;
        this.refreshControlStates();
      }
    );
    this.stepButton = new PhaserButton(
      this,
      0,
      0,
      ACTION_BUTTON_WIDTH,
      ACTION_BUTTON_HEIGHT,
      'Step',
      () => {
        if (!this.running && !this.simulation.isTerminal()) {
          this.simulation.step();
        }
      }
    );
    this.resetButton = new PhaserButton(
      this,
      0,
      0,
      ACTION_BUTTON_WIDTH,
      ACTION_BUTTON_HEIGHT,
      'Reset',
      () => {
        const fresh: WatorSimulation = new WatorSimulation();
        this.simulation = fresh;
        setSimulation(fresh);
        this.running = true;
        this.accumulator = 0;
        this.refreshControlStates();
      }
    );
  }

  /**
   * Syncs button labels and enabled states with current run state:
   * Step disabled while running or terminal, Play disabled while running
   * or terminal, per the action-control requirements.
   */
  private refreshControlStates(): void {
    const terminal: boolean = this.simulation.isTerminal();

    // Play/Pause stays enabled while non-terminal so it can toggle both ways;
    // in a terminal state the requirement is that Play is disabled entirely.
    this.playPauseButton.enabled = !terminal;
    this.playPauseButton.label = this.running ? 'Pause' : 'Play';
    this.stepButton.enabled = !this.running && !terminal;

    // Highlight the active speed selection.
    for (let i = 0; i < this.speedButtons.length; i++) {
      this.speedButtons[i]!.selected = i === this.speedIndex;
    }
  }

  /**
   * Recomputes layout regions from the current window size and repositions
   * every widget. Simulation grid dimensions are never changed here.
   */
  private relayout(): void {
    const width: number = this.scale.width;
    const height: number = this.scale.height;
    this.layout = computeLayout(width, height);
    this.worldRect = fitWorld(this.layout.world, this.simulation.width, this.simulation.height);

    this.statsPanel.layout(
      this.layout.stats.x,
      this.layout.stats.y,
      this.layout.stats.width,
      this.layout.stats.height,
      this.layout.narrow
    );

    // Position speed buttons in one horizontal row at the top of controls.
    const controls: Rect = this.layout.controls;
    const speedCount: number = this.speedButtons.length;
    const spacing: number = controls.width / (speedCount + 1);
    for (let i = 0; i < speedCount; i++) {
      this.speedButtons[i]!.setPosition(
        controls.x + spacing * (i + 1) - SPEED_BUTTON_WIDTH / 2,
        controls.y + 14
      );
    }

    // Action buttons stacked on their own rows below the speed row.
    const actionX: number = controls.x + (controls.width - ACTION_BUTTON_WIDTH) / 2;
    this.playPauseButton.setPosition(actionX, controls.y + 70);
    this.stepButton.setPosition(actionX, controls.y + 120);
    this.resetButton.setPosition(actionX, controls.y + 170);

    this.refreshControlStates();
  }

  /**
   * Resize handler: recomputes layout only; simulation state is untouched.
   */
  private handleResize(): void {
    this.relayout();
  }

  /**
   * Renders the world (water background plus creature circles), refreshes
   * stats text, and redraws the history chart.
   */
  private render(): void {
    const cellSize: number = Math.min(
      this.worldRect.width / this.simulation.width,
      this.worldRect.height / this.simulation.height
    );
    const originX: number = this.worldRect.x;
    const originY: number = this.worldRect.y;

    this.worldGraphics.clear();
    this.worldGraphics.fillStyle(CONFIG.colors.water, 1);
    this.worldGraphics.fillRect(originX, originY, this.worldRect.width, this.worldRect.height);

    const registry: Map<number, import('../simulation/Entity').Entity> = (
      this.simulation as unknown as { entities: Map<number, import('../simulation/Entity').Entity> }
    ).entities;
    for (const entity of registry.values()) {
      if (!entity.alive) {
        continue;
      }
      const isShark: boolean = entity.type === 'shark';
      const radius: number = cellSize * (isShark ? CONFIG.sharkRadiusFactor : CONFIG.fishRadiusFactor);
      this.worldGraphics.fillStyle(isShark ? CONFIG.colors.shark : CONFIG.colors.fish, 1);
      this.worldGraphics.fillCircle(
        originX + (entity.x + 0.5) * cellSize,
        originY + (entity.y + 0.5) * cellSize,
        radius
      );
    }

    this.statsPanel.update(
      this.simulation.chronons,
      this.simulation.fishCount,
      this.simulation.sharkCount,
      this.statusForDisplay()
    );
    this.chart.render(
      this.layout.chart.x,
      this.layout.chart.y,
      this.layout.chart.width,
      this.layout.chart.height,
      this.simulation.populationHistory
    );
  }

  /**
   * Maps engine state to the displayed status string, distinguishing
   * Running/Paused for non-terminal states.
   *
   * @returns The status text to display.
   */
  private statusForDisplay(): SimulationStatus {
    if (this.simulation.isTerminal()) {
      return this.simulation.status;
    }
    return this.running ? 'Running' : 'Paused';
  }
}
