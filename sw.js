const CACHE_NAME = 'dbs-amguri-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // You can add other essential static files here, like CSS or icons
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Try to serve from cache, fall back to network, fallback to nothing
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).catch(() => {
        // Optional: you can add offline fallback for navigations only
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
