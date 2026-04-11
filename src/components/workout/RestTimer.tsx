"use client";

import { useEffect, useState } from "react";
import { SkipForward, X } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";

export default function RestTimer() {
  const restTimer = useWorkoutStore((s) => s.restTimer);
  const dismissRestTimer = useWorkoutStore((s) => s.dismissRestTimer);
  const [remaining, setRemaining] = useState(0);

  const isActive = restTimer?.active ?? false;
  const endAt = restTimer?.endAt ?? 0;

  useEffect(() => {
    if (!isActive) return;
    const update = () => {
      const r = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(r);
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [isActive, endAt]);

  // Dismiss via effet séparé pour ne pas muter le store depuis l'intervalle
  useEffect(() => {
    if (remaining === 0 && restTimer?.active) {
      dismissRestTimer();
    }
  }, [remaining, restTimer, dismissRestTimer]);

  if (!restTimer?.active) return null;

  const progress = restTimer.duration > 0 ? remaining / restTimer.duration : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div
      className="fixed bottom-14 left-5 right-5 z-40 flex items-center gap-3.5 px-4 py-3.5 rounded-[18px]"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      {/* Anneau SVG warm */}
      <svg width={44} height={44} viewBox="0 0 44 44" className="shrink-0">
        <circle
          cx={22}
          cy={22}
          r={18}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={3}
        />
        <circle
          cx={22}
          cy={22}
          r={18}
          fill="none"
          stroke="#74BF7A"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 18}
          strokeDashoffset={2 * Math.PI * 18 * progress}
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>

      {/* Temps + label */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[8px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Temps de repos
        </p>
        <p
          className="text-[22px] leading-[1.2]"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {mins > 0
            ? `${mins}:${secs.toString().padStart(2, "0")}`
            : `${secs}s`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={dismissRestTimer}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-opacity active:opacity-60"
          style={{
            background: "rgba(0,0,0,0.06)",
            color: "var(--text-muted)",
          }}
        >
          <SkipForward size={12} />
        </button>
        <button
          onClick={dismissRestTimer}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-opacity active:opacity-60"
          style={{
            background: "rgba(0,0,0,0.04)",
            color: "var(--text-secondary)",
          }}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
