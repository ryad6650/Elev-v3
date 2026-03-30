'use client';

import { useEffect, useState } from 'react';
import { SkipForward, X } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';

export default function RestTimer() {
  const restTimer = useWorkoutStore((s) => s.restTimer);
  const dismissRestTimer = useWorkoutStore((s) => s.dismissRestTimer);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!restTimer?.active) return;
    const update = () => {
      const r = Math.max(0, Math.ceil((restTimer.endAt - Date.now()) / 1000));
      setRemaining(r);
      if (r === 0) dismissRestTimer();
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [restTimer, dismissRestTimer]);

  if (!restTimer?.active) return null;

  const progress = restTimer.duration > 0 ? remaining / restTimer.duration : 0;
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 20px)' }}
    >
      <div
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl mx-4 w-full max-w-[390px]"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Anneau SVG compact */}
        <svg width={40} height={40} viewBox="0 0 40 40" className="shrink-0">
          <circle cx={20} cy={20} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={3.5} />
          <circle
            cx={20} cy={20} r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
            transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          />
        </svg>

        {/* Temps + label */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Temps de repos
          </p>
          <p className="text-2xl font-bold tabular-nums leading-tight" style={{ color: 'var(--text-primary)' }}>
            {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`}
          </p>
        </div>

        {/* Fermer */}
        <button
          onClick={dismissRestTimer}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity active:opacity-60"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>

        {/* Passer */}
        <button
          onClick={dismissRestTimer}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity active:opacity-60"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <SkipForward size={15} />
        </button>
      </div>
    </div>
  );
}
