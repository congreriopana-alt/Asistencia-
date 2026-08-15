const CACHE = 'elrio-v3';
const BASE  = '/Asistencia-/';

// Solo cachear archivos locales, NUNCA bloquear peticiones externas
const LOCAL_FILES = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon.png',
  BASE + 'icon-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(LOCAL_FILES.map(f => c.add(f)));
    })
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

  // NUNCA interceptar peticiones a Google Scripts o Google Sheets
  if (
    url.includes('script.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleapis.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Para archivos locales: cache first, luego red
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
