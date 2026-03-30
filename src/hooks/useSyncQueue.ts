'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getQueuedOperations, removeOperation, type OfflineOperation } from '@/lib/offlineQueue';
import { useOnlineStatus } from './useOnlineStatus';

// Rejoue une opération en appelant la Server Action correspondante
async function replayOperation(op: OfflineOperation): Promise<void> {
  switch (op.type) {
    case 'UPSERT_POIDS': {
      const { upsertPoids } = await import('@/app/actions/poids');
      await upsertPoids(op.payload.date, op.payload.poids);
      break;
    }
    case 'DELETE_POIDS': {
      const { deletePoids } = await import('@/app/actions/poids');
      await deletePoids(op.payload.id);
      break;
    }
    case 'ADD_NUTRITION': {
      const { addNutritionEntry } = await import('@/app/actions/nutrition');
      await addNutritionEntry(
        op.payload.repas,
        op.payload.alimentId,
        op.payload.quantiteG,
        op.payload.date
      );
      break;
    }
    case 'DELETE_NUTRITION': {
      const { deleteNutritionEntry } = await import('@/app/actions/nutrition');
      await deleteNutritionEntry(op.payload.id);
      break;
    }
    case 'UPDATE_PROFIL': {
      const { updateInfosProfil } = await import('@/app/actions/profil');
      await updateInfosProfil(op.payload);
      break;
    }
    case 'UPDATE_OBJECTIFS': {
      const { updateObjectifsNutrition } = await import('@/app/actions/profil');
      await updateObjectifsNutrition(op.payload);
      break;
    }
    default: {
      const exhaustive: never = op;
      console.warn('Type opération offline inconnu:', exhaustive);
    }
  }
}

/**
 * Traite la file d'attente offline quand la connexion revient.
 * À monter une seule fois dans le layout racine.
 */
export function useSyncQueue(): void {
  const isOnline = useOnlineStatus();
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const ops = await getQueuedOperations();
      if (ops.length === 0) return;

      console.info(`[Élev] Synchronisation : ${ops.length} opération(s) en attente`);

      for (const item of ops) {
        try {
          await replayOperation(item.operation);
          await removeOperation(item.id);
        } catch (err) {
          // Laisser dans la queue pour la prochaine tentative
          console.warn('[Élev] Échec replay opération offline:', item.operation.type, err);
          break; // Arrêter si réseau encore instable
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  // Traiter la queue quand on revient en ligne
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Écouter les messages du Service Worker (Background Sync)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'PROCESS_SYNC_QUEUE') {
        processQueue();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [processQueue]);
}
