"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getQueueCount } from "@/lib/offlineQueue";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Mettre à jour le compteur quand on passe hors ligne
  useEffect(() => {
    if (!isOnline) {
      getQueueCount()
        .then(setPendingCount)
        .catch(() => setPendingCount(0));
    }
  }, [isOnline]);

  // Afficher brièvement "synchronisation" au retour en ligne
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      setSyncing(true);
      const timer = setTimeout(() => {
        setSyncing(false);
        setPendingCount(0);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount]);

  if (isOnline && !syncing) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 ${
        syncing ? "bg-[var(--accent)]" : "bg-amber-700"
      }`}
    >
      {syncing ? (
        <>
          <RefreshCw size={13} className="animate-spin" />
          <span>Synchronisation en cours…</span>
        </>
      ) : (
        <>
          <WifiOff size={13} />
          <span>Mode hors ligne</span>
          {pendingCount > 0 && (
            <span className="opacity-80 text-xs">
              · {pendingCount} action{pendingCount > 1 ? "s" : ""} en attente
            </span>
          )}
        </>
      )}
    </div>
  );
}
