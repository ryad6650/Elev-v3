'use client';

import { useEffect, useState } from 'react';

interface Props {
  startedAt: number;
  pausedAt?: number | null;
  totalPausedMs?: number;
  large?: boolean;
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutTimer({ startedAt, pausedAt = null, totalPausedMs = 0, large = false }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Calcul défini à l'intérieur de l'effet — pas de stale closure possible
    const calc = () => {
      const pauseOffset = pausedAt ? Date.now() - pausedAt : 0;
      return Date.now() - startedAt - totalPausedMs - pauseOffset;
    };
    setElapsed(calc());
    if (pausedAt !== null) return;
    const id = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(id);
  }, [startedAt, pausedAt, totalPausedMs]);

  const text = formatDuration(elapsed);

  if (large) {
    return (
      <span className="text-4xl font-mono font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {text}
      </span>
    );
  }
  return (
    <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
      {text}
    </span>
  );
}
