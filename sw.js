const CACHE_NAME = 'dbs-amguri-v2'; // bump version when cache changes
const urlsToCache = [
  '/',
  '/manifest.json',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png',
  // Add other static resources here
];

// Precache known static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Delete old caches
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Cache-first for static, network fallback for dynamic
self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignore non-GET requests (e.g. POST for login forms)
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request, { credentials: 'include' }) // send cookies
        .then(networkResponse => {
          // Cache dynamic responses (optional: add whitelist)
          if (networkResponse && networkResponse.status === 200) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional offline fallback for navigations
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
