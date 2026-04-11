"use client";

import { Clock, ChevronDown } from "lucide-react";
import ExerciseGif from "./ExerciseGif";

export interface RoutineExercise {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  gifUrl: string | null;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
}

interface Props {
  ex: RoutineExercise;
  index: number;
  total: number;
  onUpdateSeries: (index: number, delta: number) => void;
  onUpdateReps: (index: number, value: string) => void;
  onUpdateRepsMax: (index: number, value: string) => void;
  onToggleRepsMode: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  extraActions?: React.ReactNode;
}

export default function RoutineExerciseCard({
  ex,
  index,
  onUpdateSeries,
  extraActions,
}: Props) {
  const series = Array.from({ length: ex.seriesCible }, (_, i) => i + 1);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Exercise header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <ExerciseGif gifUrl={ex.gifUrl} nom={ex.nom} size="sm" circle />
        <span
          className="flex-1 text-[17px] font-semibold leading-tight"
          style={{ color: "#008CFF" }}
        >
          {ex.nom}
        </span>
        <div className="relative">{extraActions}</div>
      </div>

      {/* Notes placeholder */}
      <div className="px-4 pb-2">
        <p className="text-[15px]" style={{ color: "var(--text-muted)" }}>
          Ajouter des notes de routine ici
        </p>
      </div>

      {/* Rest timer */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Clock size={18} style={{ color: "#008CFF" }} />
        <span
          className="text-[15px] font-semibold"
          style={{ color: "#008CFF" }}
        >
          Repos: DÉSACTIVÉ
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-4 py-1.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          className="w-14 text-[13px] font-semibold uppercase tracking-wider"
          style={{ color: "#636366" }}
        >
          Série
        </span>
        <span
          className="flex-1 text-center text-[13px] font-semibold uppercase tracking-wider"
          style={{ color: "#636366" }}
        >
          KG
        </span>
        <div className="flex-1 flex items-center justify-center gap-0.5">
          <span
            className="text-[13px] font-semibold uppercase tracking-wider"
            style={{ color: "#636366" }}
          >
            Reps
          </span>
          <ChevronDown
            size={11}
            style={{ color: "#636366" }}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Set rows */}
      {series.map((n, i) => (
        <div
          key={n}
          className="flex items-center px-4 py-4"
          style={{ background: n % 2 === 0 ? "#1C1C1E" : "transparent" }}
        >
          <span
            className="w-14 text-[17px] font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {n}
          </span>
          <span
            className="flex-1 text-center text-[17px]"
            style={{ color: "#636366" }}
          >
            -
          </span>
          <span
            className="flex-1 text-center text-[17px]"
            style={{ color: "#636366" }}
          >
            -
          </span>
        </div>
      ))}

      {/* Add series button */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={() => onUpdateSeries(index, 1)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[17px] font-semibold active:opacity-70 transition-opacity"
          style={{ background: "#1C1C1E", color: "var(--text-primary)" }}
        >
          + Ajouter une Série
        </button>
      </div>
    </div>
  );
}
