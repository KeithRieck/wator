import { CONFIG } from '../config';

/**
 * A rectangular screen region in pixels.
 */
export interface Rect {
  /** Left edge x coordinate. */
  readonly x: number;
  /** Top edge y coordinate. */
  readonly y: number;
  /** Region width in pixels. */
  readonly width: number;
  /** Region height in pixels. */
  readonly height: number;
}

/**
 * The complete set of computed layout regions for one window size.
 */
export interface Layout {
  /** Stats panel region (wide) or stats strip (narrow). */
  readonly stats: Rect;
  /** World viewport region; preserves grid aspect ratio via letterboxing. */
  readonly world: Rect;
  /** Controls region (wide) or controls strip (narrow). */
  readonly controls: Rect;
  /** Population history chart strip across the bottom. */
  readonly chart: Rect;
  /** True when the narrow (stacked) arrangement is active. */
  readonly narrow: boolean;
}

/** Minimum panel width for side panels in wide mode, in CSS pixels. */
const SIDE_PANEL_MIN_WIDTH = 150;

/** Fraction of window height reserved for the history chart strip. */
const CHART_HEIGHT_FRACTION = 0.18;

/** Narrow-mode threshold: below this width the layout stacks vertically. */
export const NARROW_THRESHOLD = 744;

/**
 * Computes pixel rectangles for every UI region from the window size.
 *
 * Wide windows use stats-left / world-center / controls-right with a chart
 * strip across the bottom. Windows narrower than the tablet threshold stack
 * stats and controls above/below the world instead.
 *
 * @param windowWidth - Current window width in CSS pixels.
 * @param windowHeight - Current window height in CSS pixels.
 * @returns The computed layout regions.
 */
export function computeLayout(windowWidth: number, windowHeight: number): Layout {
  const narrow: boolean = windowWidth < NARROW_THRESHOLD;
  const chartHeight: number = Math.max(60, Math.floor(windowHeight * CHART_HEIGHT_FRACTION));
  const bodyHeight: number = windowHeight - chartHeight;

  if (!narrow) {
    const sideWidth: number = Math.max(
      SIDE_PANEL_MIN_WIDTH,
      Math.floor((windowWidth - bodyHeight * (CONFIG.grid.width / CONFIG.grid.height)) / 2)
    );
    return {
      narrow,
      stats: { x: 0, y: 0, width: sideWidth, height: bodyHeight },
      world: { x: sideWidth, y: 0, width: windowWidth - sideWidth * 2, height: bodyHeight },
      controls: { x: windowWidth - sideWidth, y: 0, width: sideWidth, height: bodyHeight },
      chart: { x: 0, y: bodyHeight, width: windowWidth, height: chartHeight }
    };
  }

  // Narrow: stats strip on top, world in middle, controls below, chart bottom.
  const stripHeight: number = Math.max(70, Math.floor(bodyHeight * 0.16));
  const worldHeight: number = bodyHeight - stripHeight * 2;
  return {
    narrow,
    stats: { x: 0, y: 0, width: windowWidth, height: stripHeight },
    world: { x: 0, y: stripHeight, width: windowWidth, height: worldHeight },
    controls: { x: 0, y: stripHeight + worldHeight, width: windowWidth, height: stripHeight },
    chart: { x: 0, y: bodyHeight, width: windowWidth, height: chartHeight }
  };
}

/**
 * Fits the simulation grid inside the world viewport while preserving its
 * aspect ratio, returning the letterboxed drawing rectangle.
 *
 * @param viewport - The available world region.
 * @param gridWidth - Simulation grid columns.
 * @param gridHeight - Simulation grid rows.
 * @returns The largest aspect-preserving rectangle inside the viewport.
 */
export function fitWorld(viewport: Rect, gridWidth: number, gridHeight: number): Rect {
  const scale: number = Math.min(viewport.width / gridWidth, viewport.height / gridHeight);
  const width: number = scale * gridWidth;
  const height: number = scale * gridHeight;
  return {
    x: viewport.x + (viewport.width - width) / 2,
    y: viewport.y + (viewport.height - height) / 2,
    width,
    height
  };
}
