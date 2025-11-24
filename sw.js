const CACHE_NAME = 'malzeme-takip-v1';
const urlsToCache = [
  '/malzeme-takip/',
  '/malzeme-takip/index.html',
  '/malzeme-takip/style.css',
  '/malzeme-takip/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
