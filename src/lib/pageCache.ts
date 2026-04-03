/**
 * Cache mémoire côté client pour les données de pages.
 * Permet un affichage instantané lors du changement d'onglet
 * (stale-while-revalidate : affiche le cache, refresh en arrière-plan).
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, ts: Date.now() });
}
