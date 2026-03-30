'use client';

import { useCallback } from 'react';
import { enqueueOperation, type OfflineOperation } from '@/lib/offlineQueue';

interface OfflineActionResult {
  queued: boolean;
  error?: string;
}

/**
 * Wrap une Server Action avec gestion offline.
 * - En ligne  → exécute l'action normalement
 * - Hors ligne → met dans la file d'attente IndexedDB
 *
 * Usage :
 *   const { execute } = useOfflineAction();
 *   await execute(() => upsertPoids(date, poids), {
 *     type: 'UPSERT_POIDS',
 *     payload: { date, poids },
 *   });
 */
export function useOfflineAction() {
  const execute = useCallback(
    async <T>(
      action: () => Promise<T>,
      offlineOp: OfflineOperation
    ): Promise<OfflineActionResult> => {
      // Hors ligne → mettre en file d'attente immédiatement
      if (!navigator.onLine) {
        await enqueueOperation(offlineOp);
        await requestBackgroundSync();
        return { queued: true };
      }

      try {
        await action();
        return { queued: false };
      } catch (err) {
        // Si l'erreur est liée au réseau, mettre en file
        if (!navigator.onLine) {
          await enqueueOperation(offlineOp);
          await requestBackgroundSync();
          return { queued: true };
        }
        return {
          queued: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue',
        };
      }
    },
    []
  );

  return { execute };
}

async function requestBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    // L'API SyncManager n'est pas disponible sur tous les navigateurs (ex: Safari)
    if ('sync' in registration) {
      // @ts-expect-error — SyncManager types non inclus dans lib.dom
      await registration.sync.register('elev-sync');
    }
  } catch {
    // Silencieux — la queue sera traitée au prochain online event
  }
}
