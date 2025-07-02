const CACHE_NAME = 'dbs-amguri-v1';
const urlsToCache = ['/', '/manifest.json', '/offline.html'];

// Install event: cache essential assets and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch event: handle navigation and resource requests
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Navigation requests within the PWA origin
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Other requests: try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => cachedResponse || fetch(request))
  );
});
