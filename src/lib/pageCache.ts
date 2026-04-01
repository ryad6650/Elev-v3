/**
 * Cache mémoire côté client pour les données de pages.
 * Permet un affichage instantané lors du changement d'onglet
 * (stale-while-revalidate : affiche le cache, refresh en arrière-plan).
 */
const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | null {
  return (cache.get(key) as T) ?? null;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, data);
}
