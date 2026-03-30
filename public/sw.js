const CACHE_NAME = 'gigflow-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js', // Ajusta se usares Vite (normalmente não precisas listar tudo aqui)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});