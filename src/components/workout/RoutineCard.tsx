'use client';

import { MoreVertical, ChevronDown, Play } from 'lucide-react';
import type { Routine } from '@/lib/workout';
import type { RoutineExerciseData } from '@/app/actions/workout';

interface Props {
  routine: Routine;
  index: number;
  onToggle: () => void;
  onOptions: () => void;
  onStart: () => void;
  expanded: boolean;
  exercises: RoutineExerciseData[];
  loadingExpanded: boolean;
}

const ICON_PALETTE = [
  { bg: 'rgba(244,63,94,0.15)', color: '#F43F5E', shape: 'triangle' },
  { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', shape: 'circle' },
  { bg: 'rgba(234,179,8,0.15)', color: '#EAB308', shape: 'circle' },
  { bg: 'rgba(168,85,247,0.15)', color: '#A855F7', shape: 'circle' },
  { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', shape: 'circle' },
  { bg: 'rgba(249,115,22,0.15)', color: '#F97316', shape: 'circle' },
  { bg: 'rgba(6,182,212,0.15)', color: '#06B6D4', shape: 'circle' },
];

const GROUPE_COLORS: Record<string, { bg: string; text: string }> = {
  pectoraux: { bg: 'rgba(249,115,22,0.2)', text: '#FB923C' },
  épaules: { bg: 'rgba(168,85,247,0.2)', text: '#C084FC' },
  epaules: { bg: 'rgba(168,85,247,0.2)', text: '#C084FC' },
  triceps: { bg: 'rgba(236,72,153,0.2)', text: '#F472B6' },
  dos: { bg: 'rgba(59,130,246,0.2)', text: '#60A5FA' },
  biceps: { bg: 'rgba(20,184,166,0.2)', text: '#2DD4BF' },
  quadriceps: { bg: 'rgba(234,179,8,0.2)', text: '#FACC15' },
  ischios: { bg: 'rgba(59,130,246,0.2)', text: '#93C5FD' },
  fessiers: { bg: 'rgba(244,63,94,0.2)', text: '#FB7185' },
  mollets: { bg: 'rgba(34,197,94,0.2)', text: '#4ADE80' },
  abdominaux: { bg: 'rgba(249,115,22,0.2)', text: '#FB923C' },
  lombaires: { bg: 'rgba(168,85,247,0.2)', text: '#C084FC' },
};

const DEFAULT_GROUPE_COLOR = { bg: 'rgba(168,162,158,0.2)', text: '#A8A29E' };

function formatDerniereSeance(date: string | null): string {
  if (!date) return 'Jamais effectuée';
  const jours = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return 'Hier';
  return `il y a ${jours}j`;
}

export default function RoutineCard({ routine, index, onToggle, onOptions, onStart, expanded, exercises, loadingExpanded }: Props) {
  const icone = ICON_PALETTE[index % ICON_PALETTE.length];

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden transition-all"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: expanded ? 'var(--accent)' : 'var(--border)',
      }}
    >
      {/* Zone principale cliquable */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        className="flex items-center gap-3 p-4 text-left transition-all active:scale-[0.98] cursor-pointer"
      >
        {/* Icône colorée */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: icone.bg }}>
          {icone.shape === 'triangle' ? (
            <svg viewBox="0 0 24 24" width={20} height={20}><polygon points="12,4 22,20 2,20" fill={icone.color} /></svg>
          ) : (
            <div className="w-5 h-5 rounded-full" style={{ background: icone.color }} />
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>
            {routine.nom}
          </p>
          {routine.groupes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {routine.groupes.slice(0, 3).map((g) => {
                const style = GROUPE_COLORS[g] ?? DEFAULT_GROUPE_COLOR;
                return (
                  <span key={g} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.text }}>
                    {g}
                  </span>
                );
              })}
            </div>
          )}
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {routine.exercisesCount} exercice{routine.exercisesCount !== 1 ? 's' : ''}
            &nbsp;&nbsp;~{routine.dureeEstimee} min
            &nbsp;&nbsp;Dernière : {formatDerniereSeance(routine.derniereSeance)}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ChevronDown
            size={16}
            className="transition-transform duration-200"
            style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onOptions(); }}
            className="p-1.5 rounded-lg transition-opacity active:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Section dépliante */}
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-3 mb-3">
            {loadingExpanded ? (
              <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
            ) : exercises.length === 0 ? (
              <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>Aucun exercice défini</p>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ex.nom}</span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {ex.seriesCible}×{ex.repsCibleMax ? `${ex.repsCible}-${ex.repsCibleMax}` : ex.repsCible}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Play size={14} fill="white" />
            Démarrer la séance
          </button>
        </div>
      )}
    </div>
  );
}
