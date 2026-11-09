// Service worker: guarda la app en el teléfono para que abra aun sin señal.
// Al modificar index.html, subir el número de versión para forzar la actualización.
const CACHE = 'campo-sf-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Solo archivos propios de la app; las llamadas a Google Apps Script nunca se guardan en caché.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(enCache => {
      const red = fetch(e.request).then(resp => {
        if (resp && resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return resp;
      }).catch(() => enCache);
      return enCache || red;
    })
  );
});
