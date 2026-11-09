// Service worker: guarda la app en el teléfono para que abra aun sin señal.
// Al modificar index.html, subir el número de versión para que la app muestre «Nueva versión disponible».
const CACHE = 'campo-sf-v3';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

// Descarga la versión nueva sin pasar por la caché HTTP del navegador.
// No se activa sola: espera a que el usuario toque «Actualizar».
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('message', e => {
  if (e.data === 'ACTUALIZAR') self.skipWaiting();
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
    caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(enCache => {
      if (enCache) return enCache;
      return fetch(e.request).then(resp => {
        if (resp && resp.ok) c.put(e.request, resp.clone());
        return resp;
      });
    }))
  );
});
