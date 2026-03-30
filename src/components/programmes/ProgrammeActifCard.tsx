'use client';

import { ArrowRight } from 'lucide-react';
import type { Programme } from '@/lib/programmes';

interface Props {
  programme: Programme;
  onClick: () => void;
}

export default function ProgrammeActifCard({ programme, onClick }: Props) {
  const { progres } = programme;
  const pourcentage = progres
    ? Math.round(((progres.semaine_actuelle - 1) / progres.total_semaines) * 100)
    : 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl mb-5 text-left transition-transform active:scale-[0.99]"
      style={{ background: 'var(--accent)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Programme actif
        </p>
        <h2
          className="text-2xl leading-tight text-white mb-1 truncate"
          style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic' }}
        >
          {programme.nom}
        </h2>
        {progres && (
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Semaine {progres.semaine_actuelle} sur {progres.total_semaines}
          </p>
        )}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ background: '#fff', width: `${pourcentage}%` }}
          />
        </div>
      </div>
      <div
        className="flex items-center justify-center rounded-full ml-4 shrink-0"
        style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)' }}
      >
        <ArrowRight size={18} color="#fff" />
      </div>
    </button>
  );
}
