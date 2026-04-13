"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useWorkoutStore, type ActiveWorkout } from "@/store/workoutStore";
import { useShallow } from "zustand/react/shallow";

// Hydration guard : détecte quand le store persist a fini de réhydrater
const subscribe = (cb: () => void) => useWorkoutStore.subscribe(cb);
const getSnapshot = () => useWorkoutStore.persist.hasHydrated();
const getServerSnapshot = () => false;

// Timer partagé : un seul setInterval pour tous les abonnés
const sharedTimerListeners = new Set<() => void>();
let sharedTimerInterval: ReturnType<typeof setInterval> | null = null;

function subscribeSharedTimer(cb: () => void) {
  sharedTimerListeners.add(cb);
  if (!sharedTimerInterval) {
    sharedTimerInterval = setInterval(() => {
      sharedTimerListeners.forEach((fn) => fn());
    }, 1000);
  }
  return () => {
    sharedTimerListeners.delete(cb);
    if (sharedTimerListeners.size === 0 && sharedTimerInterval) {
      clearInterval(sharedTimerInterval);
      sharedTimerInterval = null;
    }
  };
}

function useElapsed(startedAt: number): string {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    return subscribeSharedTimer(() => setElapsed(Date.now() - startedAt));
  }, [startedAt]);

  const totalSecs = Math.floor(Math.max(0, elapsed) / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export { subscribeSharedTimer };

function BannerInner({
  workout,
  onClick,
}: {
  workout: ActiveWorkout;
  onClick: () => void;
}) {
  const timer = useElapsed(workout.debutAt);

  return (
    <div
      className="fixed z-40 left-0 right-0 px-[15px]"
      style={{ bottom: "100px" }}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 w-full max-w-[420px] mx-auto transition-transform active:scale-[0.98]"
        style={{
          background: "#262220",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          boxShadow:
            "0 4px 24px color-mix(in srgb, var(--accent) 15%, transparent)",
        }}
      >
        <span className="text-xl leading-none">💪</span>

        <div className="flex-1 min-w-0 text-left">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Séance en cours
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {workout.routineName ?? "Séance libre"}
          </p>
        </div>

        <span
          className="font-mono font-bold text-sm tabular-nums"
          style={{ color: "#74BF7A" }}
        >
          {timer}
        </span>

        <ChevronRight size={18} style={{ color: "#74BF7A" }} />
      </button>
    </div>
  );
}

export default function ActiveWorkoutBanner() {
  const hydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { activeWorkout, isMinimized, maximizeWorkout } = useWorkoutStore(
    useShallow((s) => ({
      activeWorkout: s.activeWorkout,
      isMinimized: s.isMinimized,
      maximizeWorkout: s.maximizeWorkout,
    })),
  );
  const pathname = usePathname();
  const router = useRouter();

  if (!hydrated || !activeWorkout) return null;

  const onWorkoutPage = pathname.startsWith("/workout");

  // Visible sur /workout si minimisé, ou sur toute autre page
  if (onWorkoutPage && !isMinimized) return null;

  const handleClick = () => {
    if (onWorkoutPage) {
      maximizeWorkout();
    } else {
      maximizeWorkout();
      router.push("/workout");
    }
  };

  return <BannerInner workout={activeWorkout} onClick={handleClick} />;
}
