'use client';

import { useEffect, useState } from 'react';

interface Props {
  startedAt: number;
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutTimer({ startedAt }: Props) {
  const [elapsed, setElapsed] = useState(Date.now() - startedAt);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
      {formatDuration(elapsed)}
    </span>
  );
}
