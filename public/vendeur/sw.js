// Service worker minimal — espace vendeur Le Lotus Bleu
const CACHE_NAME = "lotus-vendeur-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  // Laisser passer tous les non-GET (POST pour les server actions, etc.)
  if (event.request.method !== "GET") return;

  // Network-first : on essaie le réseau, puis le cache, jamais d'erreur
  event.respondWith(
    fetch(event.request).then((response) => {
      // Mettre en cache les réponses valides
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || Response.error();
    })
  );
});
