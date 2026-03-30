import { Calendar, Clock, Zap } from 'lucide-react';
import type { WorkoutHistoryItem } from '@/lib/workout';

interface Props {
  workout: WorkoutHistoryItem;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr + 'T12:00:00'));
}

export default function WorkoutHistoryCard({ workout }: Props) {
  return (
    <div
      className="p-4 rounded-2xl border"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {workout.routineNom ?? 'Séance libre'}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={11} />
              {formatDate(workout.date)}
            </span>
            {workout.duree_minutes != null && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} />
                {workout.duree_minutes} min
              </span>
            )}
          </div>
        </div>
        {workout.volume > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold shrink-0" style={{ color: 'var(--accent-text)' }}>
            <Zap size={13} />
            {workout.volume} kg
          </span>
        )}
      </div>

      {workout.exercises.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {workout.exercises.slice(0, 4).map((ex, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {ex.nom} ×{ex.setsCount}
            </span>
          ))}
          {workout.exercises.length > 4 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              +{workout.exercises.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
