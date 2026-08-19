const CACHE = 'elrio-v6';

const ARCHIVOS = [
  '/Asistencia-/index.html',
  '/Asistencia-/dashboard_el_rio.html',
  '/Asistencia-/manifest.json',
  '/Asistencia-/manifest-dash.json',
  '/Asistencia-/icon.png',
  '/Asistencia-/icon-192.png',
  '/Asistencia-/icon-dash.png',
  '/Asistencia-/icon-dash-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(ARCHIVOS.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Externas: solo red
  if (url.includes('google.com') || url.includes('gstatic.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status:503})));
    return;
  }
  // Locales: caché primero, actualizar en segundo plano
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const net = fetch(e.request).then(res => {
          if (res && res.status === 200) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    )
  );
});
