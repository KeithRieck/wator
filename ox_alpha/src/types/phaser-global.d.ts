/**
 * Ambient declaration for the Phaser 4 global loaded from the CDN script tag
 * in index.html. Phaser is a runtime external: it is never bundled, so the
 * app references `window.Phaser` (typed here) instead of importing it.
 */
declare global {
  /**
   * The Phaser namespace provided by the CDN build of Phaser 4.x.
   * Typed loosely because the full Phaser type surface is consumed via
   * the devDependency's module types where needed.
   */
  // eslint-disable-next-line no-var
  var Phaser: unknown;
}

export {};
