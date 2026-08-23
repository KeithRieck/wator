import { defineConfig } from 'vite';

/**
 * Vite configuration for the Wa-Tor static build.
 *
 * Uses a relative base so the compiled output deploys from any subpath,
 * including GitHub Pages project sites such as /wator/ox_alpha/.
 *
 * Phaser is loaded from a CDN script tag in index.html and must never be
 * bundled; it is marked external and referenced via the `Phaser` global.
 */
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      external: [/^phaser$/],
      output: {
        globals: {
          phaser: 'Phaser'
        }
      }
    }
  }
});
