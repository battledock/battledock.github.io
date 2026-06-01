// Battle Dock — service worker minimal (réseau d'abord, pas de cache périmé)
const CACHE = 'battledock-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Réseau d'abord (jeu en ligne via Supabase), repli sur le cache si hors-ligne
  e.respondWith(
    fetch(req).then((res) => {
      try {
        const copy = res.clone();
        if (req.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
      } catch (_) {}
      return res;
    }).catch(() => caches.match(req))
  );
});
