'use client';

import { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface Props {
  gifUrl: string | null;
  nom: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { container: 'w-10 h-10', icon: 14, radius: 'rounded-lg' },
  md: { container: 'w-14 h-14', icon: 18, radius: 'rounded-xl' },
  lg: { container: 'w-24 h-24', icon: 28, radius: 'rounded-2xl' },
};

export default function ExerciseGif({ gifUrl, nom, size = 'md', className = '' }: Props) {
  const [error, setError] = useState(false);
  const s = SIZES[size];

  if (!gifUrl || error) {
    return (
      <div
        className={`${s.container} ${s.radius} flex items-center justify-center shrink-0 ${className}`}
        style={{ background: 'var(--bg-elevated)' }}
      >
        <Dumbbell size={s.icon} style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} ${s.radius} overflow-hidden shrink-0 ${className}`}
      style={{ background: 'var(--bg-elevated)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={gifUrl}
        alt={nom}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
