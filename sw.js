const CACHE = 'elrio-v5';

const ARCHIVOS = [
  '/Asistencia-/',
  '/Asistencia-/index.html',
  '/Asistencia-/dashboard_el_rio.html',
  '/Asistencia-/manifest.json',
  '/Asistencia-/manifest-dash.json',
  '/Asistencia-/icon.png',
  '/Asistencia-/icon-192.png',
  '/Asistencia-/icon-dash.png',
  '/Asistencia-/icon-dash-192.png',
  '/Asistencia-/sw.js'
];

// Instalar: guardar todos los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        ARCHIVOS.map(url => cache.add(url).catch(err => console.warn('No se pudo cachear:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: caché primero para archivos locales, red para externos
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Peticiones externas (Google, etc.) — siempre red directa
  if (
    url.includes('script.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleapis.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('Sin conexión', { status: 503 }))
    );
    return;
  }

  // Archivos locales: caché primero, luego red y actualizar caché
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response && response.status === 200) {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(() => cached); // Sin red: usar caché
        return cached || networkFetch;
      })
    )
  );
});
