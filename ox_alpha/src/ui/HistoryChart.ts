import type * as Phaser from 'phaser';
import { CONFIG } from '../config';

/**
 * Bottom-strip population history chart drawn with Phaser Graphics.
 *
 * Renders fish and shark lines in the same green/blue palette as the world,
 * auto-scaling the y-axis to the rolling window's maximum, with no titles
 * or text labels per the UI requirements.
 */
export class HistoryChart {
  private readonly graphics: Phaser.GameObjects.Graphics;

  /**
   * Creates the chart graphics object.
   *
   * @param scene - The owning Phaser scene.
   */
  public constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /**
   * Redraws the chart from the given samples inside the region.
   *
   * @param x - Region left edge.
   * @param y - Region top edge.
   * @param width - Region width.
   * @param height - Region height.
   * @param samples - Population samples (chronon, fish, sharks), oldest first.
   */
  public render(
    x: number,
    y: number,
    width: number,
    height: number,
    samples: readonly { chronon: number; fish: number; sharks: number }[]
  ): void {
    this.graphics.clear();

    // Chart background strip slightly darker than water for separation.
    this.graphics.fillStyle(0x082c46, 1);
    this.graphics.fillRect(x, y, width, height);

    if (samples.length < 2) {
      return;
    }

    const maxPopulation: number = Math.max(
      ...samples.map((s) => Math.max(s.fish, s.sharks)),
      1
    );
    // Round up to a coarse "nice" maximum so the axis changes rarely.
    const niceMax: number = niceCeil(maxPopulation);
    const padding: number = 6;
    const plotWidth: number = width - padding * 2;
    const plotHeight: number = height - padding * 2;
    const stepX: number = plotWidth / (samples.length - 1);

    this.drawLine(samples, padding, stepX, y + padding, plotHeight, niceMax, (s) => s.fish, CONFIG.colors.fish);
    this.drawLine(samples, padding, stepX, y + padding, plotHeight, niceMax, (s) => s.sharks, CONFIG.colors.shark);
  }

  /**
   * Plots one population series as a polyline.
   *
   * @param samples - The full sample list.
   * @param padding - Horizontal inset from the region edge.
   * @param stepX - Pixels between consecutive samples.
   * @param top - Plot area top y coordinate.
   * @param plotHeight - Plot area height in pixels.
   * @param maxValue - Axis maximum used for scaling.
   * @param pick - Value selector for the series.
   * @param color - Line color.
   */
  private drawLine(
    samples: readonly { chronon: number; fish: number; sharks: number }[],
    padding: number,
    stepX: number,
    top: number,
    plotHeight: number,
    maxValue: number,
    pick: (s: { chronon: number; fish: number; sharks: number }) => number,
    color: number
  ): void {
    this.graphics.lineStyle(1.5, color, 1);
    this.graphics.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const value: number = pick(samples[i]!);
      const px: number = padding + i * stepX;
      const py: number = top + plotHeight - (value / maxValue) * plotHeight;
      if (i === 0) {
        this.graphics.moveTo(px, py);
      } else {
        this.graphics.lineTo(px, py);
      }
    }
    this.graphics.strokePath();
  }
}

/**
 * Rounds a value up to a coarse nice number (1/2/5 x 10^k) for stable axes.
 *
 * @param value - The raw maximum to round.
 * @returns The smallest nice number greater than or equal to the value.
 */
function niceCeil(value: number): number {
  const exponent: number = Math.floor(Math.log10(value));
  const base: number = Math.pow(10, exponent);
  for (const multiple of [1, 2, 5, 10]) {
    if (value <= multiple * base) {
      return multiple * base;
    }
  }
  return 10 * base;
}
