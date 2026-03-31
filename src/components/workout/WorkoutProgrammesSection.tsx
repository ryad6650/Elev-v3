'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProgrammeActifCard from '@/components/programmes/ProgrammeActifCard';
import ProgrammeCard from '@/components/programmes/ProgrammeCard';
import ProgrammeDetail from '@/components/programmes/ProgrammeDetail';
import CreateProgrammeModal from '@/components/programmes/CreateProgrammeModal';
import type { ProgrammesPageData, Programme } from '@/lib/programmes';

interface Props {
  data: ProgrammesPageData;
}

export default function WorkoutProgrammesSection({ data }: Props) {
  const [selection, setSelection] = useState<Programme | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mb-2">
      {data.programmeActif && (
        <ProgrammeActifCard
          programme={data.programmeActif}
          onClick={() => setSelection(data.programmeActif)}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Mes programmes
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity active:opacity-70"
          style={{ color: 'var(--accent-text)' }}
        >
          <Plus size={14} />
          Créer
        </button>
      </div>

      {data.programmes.length > 0 ? (
        data.programmes.map((p) => (
          <ProgrammeCard
            key={p.id}
            programme={p}
            estActif={p.id === data.programmeActif?.id}
            onClick={() => setSelection(p)}
          />
        ))
      ) : (
        <div
          className="text-center py-8 rounded-2xl mb-4"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun programme — crée ton premier plan structuré.
          </p>
        </div>
      )}

      {selection && (
        <ProgrammeDetail
          programme={selection}
          estActif={selection.id === data.programmeActif?.id}
          onClose={() => setSelection(null)}
        />
      )}

      {createOpen && (
        <CreateProgrammeModal
          routinesDisponibles={data.routinesDisponibles}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
