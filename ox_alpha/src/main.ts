/**
 * Application entry point for the Wa-Tor simulation.
 *
 * Configures and starts the Phaser game that owns the entire browser
 * window. Scenes are registered here; all simulation logic lives in the
 * framework-independent engine under src/simulation/.
 */
import type * as Phaser from 'phaser';
import { getPhaser } from './phaser';
import { BootScene } from './scenes/BootScene';
import { SimulationScene } from './scenes/SimulationScene';

/**
 * Starts the Phaser game once the CDN global is available.
 * Exits quietly with a console error if Phaser failed to load.
 */
function startGame(): void {
  let PhaserGlobal: typeof Phaser;
  try {
    PhaserGlobal = getPhaser();
  } catch {
    console.error('Wa-Tor: Phaser failed to load from the CDN.');
    return;
  }

  const game = new PhaserGlobal.Game({
    type: PhaserGlobal.AUTO,
    backgroundColor: '#0a3d62',
    scale: {
      mode: PhaserGlobal.Scale.RESIZE,
      autoCenter: PhaserGlobal.Scale.NO_CENTER,
      width: '100%',
      height: '100%'
    },
    // Registration uses class instances. Phaser 4 auto-starts only the first
    // scene in the array; SimulationScene is started by BootScene after the
    // world exists. Keys are set via super('key') in each scene constructor.
    scene: [new BootScene(), new SimulationScene()]
  });
  (window as unknown as { __game?: unknown }).__game = game;
}

/**
 * Registers the service worker for PWA support. Registration is
 * best-effort: failures (e.g., unsupported browsers, non-secure contexts)
 * are logged and ignored so the game still runs.
 */
function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  navigator.serviceWorker.register('./sw.js').catch((error: unknown) => {
    console.warn('Wa-Tor: service worker registration failed.', error);
  });
}

startGame();
registerServiceWorker();
