/**
 * Wa-Tor service worker: precaches the same-origin app shell and serves it
 * cache-first. The CDN Phaser script is intentionally NOT cached; first-load
 * and offline behavior for CDN content depends on network availability
 * (accepted per wator-app-shell Requirement 6).
 */
const CACHE_NAME = 'wator-v1-ox_alpha';

/** Same-origin assets to precache at install time (relative to scope). */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Same-origin only: cache-first, then network (and cache the result).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
              }
              return response;
            })
            .catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Cross-origin (CDN Phaser): pass through to the network untouched.
});
