const CACHE = 'elrio-dash-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled([
        '/Asistencia-/dash/',
        '/Asistencia-/dashboard_el_rio.html',
        '/Asistencia-/manifest-dash.json',
        '/Asistencia-/icon-dash.png',
        '/Asistencia-/icon-dash-192.png'
      ].map(url => cache.add(url).catch(() => {})))
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
  if (url.includes('google.com') || url.includes('gstatic.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('',{status:503})));
    return;
  }
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
