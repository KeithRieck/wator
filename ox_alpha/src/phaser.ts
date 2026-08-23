import type * as PhaserTypes from 'phaser';

/**
 * Accessor for the Phaser 4 namespace loaded from the CDN classic script
 * tag in index.html.
 *
 * The app deliberately does NOT import Phaser as a module: the CDN build
 * must be the single shared instance so scene classes extend the exact
 * same `Phaser.Scene` constructor that the SceneManager checks with
 * `instanceof`.
 */
export function getPhaser(): typeof PhaserTypes {
  const phaser = (window as unknown as { Phaser?: typeof PhaserTypes }).Phaser;
  if (phaser === undefined) {
    throw new Error('Phaser failed to load from the CDN.');
  }
  return phaser;
}
