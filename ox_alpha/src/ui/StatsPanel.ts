import type * as Phaser from 'phaser';
import { CONFIG } from '../config';
import type { SimulationStatus } from '../simulation/WatorSimulation';

/**
 * Left-side (or top-strip in narrow mode) stats panel drawn with Phaser
 * Text: chronon counter, fish and shark populations, and run status.
 */
export class StatsPanel {
  private readonly chrononText: Phaser.GameObjects.Text;
  private readonly fishText: Phaser.GameObjects.Text;
  private readonly sharksText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;

  /**
   * Creates the stats panel texts.
   *
   * @param scene - The owning Phaser scene.
   */
  public constructor(scene: Phaser.Scene) {
    const style = { fontSize: '18px', color: '#ffffff' };
    this.chrononText = scene.add.text(0, 0, '', style);
    this.fishText = scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: `#${CONFIG.colors.fish.toString(16).padStart(6, '0')}`
    });
    this.sharksText = scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: `#${CONFIG.colors.shark.toString(16).padStart(6, '0')}`
    });
    this.statusText = scene.add.text(0, 0, '', { fontSize: '18px', color: '#ffffff' });
  }

  /**
   * Repositions the panel rows inside the given region.
   *
   * @param x - Region left edge.
   * @param y - Region top edge.
   * @param width - Region width (used for horizontal centering in strips).
   * @param height - Region height.
   * @param horizontal - True to lay rows out left-to-right (narrow strip).
   */
  public layout(x: number, y: number, width: number, height: number, horizontal: boolean): void {
    const lineHeight: number = 26;
    if (horizontal) {
      const spacing: number = width / 4;
      this.chrononText.setPosition(x + spacing * 0.5 - this.chrononText.width / 2, y + height / 2 - lineHeight / 2);
      this.fishText.setPosition(x + spacing * 1.5 - this.fishText.width / 2, y + height / 2 - lineHeight / 2);
      this.sharksText.setPosition(x + spacing * 2.5 - this.sharksText.width / 2, y + height / 2 - lineHeight / 2);
      this.statusText.setPosition(x + spacing * 3.5 - this.statusText.width / 2, y + height / 2 - lineHeight / 2);
      return;
    }
    this.chrononText.setPosition(x + 12, y + 20);
    this.fishText.setPosition(x + 12, y + 20 + lineHeight);
    this.sharksText.setPosition(x + 12, y + 20 + lineHeight * 2);
    this.statusText.setPosition(x + 12, y + 20 + lineHeight * 3);
  }

  /**
   * Updates the displayed values.
   *
   * @param chronon - Completed chronon count.
   * @param fish - Living fish population.
   * @param sharks - Living shark population.
   * @param status - Current simulation status string.
   */
  public update(chronon: number, fish: number, sharks: number, status: SimulationStatus): void {
    this.chrononText.setText(`Chronon: ${chronon}`);
    this.fishText.setText(`Fish: ${fish}`);
    this.sharksText.setText(`Sharks: ${sharks}`);
    this.statusText.setText(`${status}`);
  }
}
