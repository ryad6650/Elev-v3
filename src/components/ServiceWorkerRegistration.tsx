'use client';

import { useEffect } from 'react';
import { useSyncQueue } from '@/hooks/useSyncQueue';

/**
 * Enregistre le Service Worker et active la synchronisation offline.
 * Doit être monté une seule fois dans le RootLayout.
 */
export default function ServiceWorkerRegistration() {
  // Active la surveillance + replay de la file d'attente
  useSyncQueue();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Vérifier les mises à jour du SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau SW disponible — on active immédiatement
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((err) => {
        // Ne pas bloquer l'app si le SW échoue (env dev, HTTPS requis)
        console.warn('[Élev] Service Worker non disponible:', err);
      });
  }, []);

  return null;
}
