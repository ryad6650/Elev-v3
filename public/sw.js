// Service Worker — Élev v3
// Stratégies : cache-first (assets statiques), stale-while-revalidate (pages)

const CACHE_NAME = "elev-v2";
const GIF_CACHE_NAME = "elev-gifs";
const SYNC_TAG = "elev-sync";

// Assets statiques Next.js → permanents (hash dans le nom)
const STATIC_PATTERN = /\/_next\/static\//;
// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  // Pas de pré-cache des routes protégées par auth (risque de cacher la page login)
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== GIF_CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer : méthodes non-GET, extensions Chrome
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // Images d'exercices (exercisedb + Supabase Storage) → cache-first dédié
  if (
    (url.hostname === "static.exercisedb.dev" &&
      url.pathname.endsWith(".gif")) ||
    (url.hostname.endsWith(".supabase.co") &&
      url.pathname.includes("/exercise-images/"))
  ) {
    event.respondWith(gifCacheFirst(request));
    return;
  }

  // Ignorer les autres origines externes
  if (url.origin !== self.location.origin) return;

  // Assets statiques Next.js (hachés) → cache-first
  if (STATIC_PATTERN.test(url.pathname) || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Requêtes de navigation (pages HTML) → toujours réseau (auth-aware, RSC)
  if (request.mode === "navigate") {
    return;
  }

  // Requêtes API (lecture) → network-first avec fallback cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Autres ressources (fonts, images) → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ─── Background Sync ─────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsToSync());
  }
});

// ─── Messages depuis le client ────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── Stratégies de cache ──────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ offline: true, error: "Hors ligne" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  // Retourner le cache immédiatement, mettre à jour en arrière-plan
  return cached || (await fetchPromise) || offlinePage();
}

function offlinePage() {
  return new Response(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Élev — Hors ligne</title>
    <style>body{background:#0C0A09;color:#FAFAF9;font-family:sans-serif;
    display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
    h1{color:#E8860C;font-size:1.5rem;margin-bottom:0.5rem;}
    p{color:#A8A29E;font-size:0.9rem;}</style></head>
    <body><div><h1>Élev</h1><p>Vous êtes hors ligne.<br>Reconnectez-vous pour continuer.</p></div></body></html>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function gifCacheFirst(request) {
  const cache = await caches.open(GIF_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // Pas de GIF en cache + pas de réseau → réponse vide transparente
    return new Response("", { status: 503 });
  }
}

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) =>
    client.postMessage({ type: "PROCESS_SYNC_QUEUE" }),
  );
}
