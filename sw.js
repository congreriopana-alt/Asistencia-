const CACHE = 'elrio-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo dejar pasar todo — no cachear nada para evitar problemas
self.addEventListener('fetch', e => {
  // Peticiones externas: siempre ir a la red directamente
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Archivos locales: red primero, cache como respaldo
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
