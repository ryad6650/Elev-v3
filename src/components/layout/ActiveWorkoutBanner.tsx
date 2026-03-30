'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useWorkoutStore, type ActiveWorkout } from '@/store/workoutStore';

function useElapsed(startedAt: number): string {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    setElapsed(Date.now() - startedAt);
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const totalSecs = Math.floor(Math.max(0, elapsed) / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function BannerInner({ workout, onClick }: { workout: ActiveWorkout; onClick: () => void }) {
  const timer = useElapsed(workout.debutAt);

  return (
    <div className="fixed z-40 left-0 right-0 px-[15px]" style={{ bottom: '100px' }}>
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 w-full max-w-[420px] mx-auto transition-transform active:scale-[0.98]"
        style={{
          background: 'color-mix(in srgb, var(--bg-secondary) 95%, transparent)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--accent)',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(232,134,12,0.15)',
        }}
      >
        <span className="text-xl leading-none">💪</span>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Séance en cours
          </p>
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {workout.routineName ?? 'Séance libre'}
          </p>
        </div>

        <span className="font-mono font-bold text-sm tabular-nums" style={{ color: 'var(--accent-text)' }}>
          {timer}
        </span>

        <ChevronRight size={18} style={{ color: 'var(--accent)' }} />
      </button>
    </div>
  );
}

export default function ActiveWorkoutBanner() {
  const [hydrated, setHydrated] = useState(false);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated || !activeWorkout || pathname.startsWith('/workout')) return null;

  return <BannerInner workout={activeWorkout} onClick={() => router.push('/workout')} />;
}
