'use client';

import { useEffect, useState } from 'react';
import { X, SkipForward } from 'lucide-react';
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
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: 'rgba(12, 10, 9, 0.92)', backdropFilter: 'blur(8px)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Temps de repos
      </p>

      {/* Anneau SVG */}
      <svg width={104} height={104} viewBox="0 0 104 104">
        <circle cx={52} cy={52} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={6} />
        <circle
          cx={52} cy={52} r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          transform="rotate(-90 52 52)"
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
        />
        <text x={52} y={57} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--text-primary)" fontFamily="sans-serif">
          {mins}:{secs.toString().padStart(2, '0')}
        </text>
      </svg>

      <div className="flex gap-3">
        <button
          onClick={dismissRestTimer}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
        >
          <X size={15} /> Fermer
        </button>
        <button
          onClick={dismissRestTimer}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <SkipForward size={15} /> Passer
        </button>
      </div>
    </div>
  );
}
