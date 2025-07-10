const CACHE_NAME = 'dbs-amguri-v2'; // bump version when cache changes
const urlsToCache = [
  '/',                     // Homepage (desktop)
  '/?m=1',                 // Homepage (mobile)
  '/p/about.html',
  '/p/contact.html',
  '/p/chat.html',
  '/offline.html',         // Optional: custom offline fallback page

  // PWA manifest hosted on GitHub
  'https://raw.githubusercontent.com/Dipu-Bhandari/manifest/refs/heads/main/manifest.json',

  // Logo used in PWA and meta tags
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgf9zNHbEv3KkOhNNaVMwg8iPTY2y9K3lEzsD4vMifAooOUd-Srz9cba8Tv64OVqRxLvMb4pKTuAMAvGXAz8hlp97jjcTBnXgaO_WKK8H4nXQ0nI4wkvPZxJ_NTtXXrDdclY1aD2yzmtoSKZC2OOMxkYy3_paLEvqPP16iQHX87LG5rtEN2tUO2H_AMAFg/s192-rw/Black%20Clean%20Minimalist%20Circle%20Monogram%20Logo%20(1).png',

  // Bootstrap CSS (loaded from CDN)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
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
