"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ProgrammeDetail from "@/components/programmes/ProgrammeDetail";
import CreateProgrammeModal from "@/components/programmes/CreateProgrammeModal";
import { getRoutineExercises } from "@/app/actions/routines";
import { useWorkoutStore } from "@/store/workoutStore";
import type { ProgrammesPageData, Programme } from "@/lib/programmes";

function getEmoji(nom: string, i: number): string {
  const n = nom.toLowerCase();
  if (n.includes("push") || n.includes("ppl")) return "💪";
  if (n.includes("full") || n.includes("corps")) return "🏋️";
  if (n.includes("upper") || n.includes("lower")) return "🎯";
  if (n.includes("force") || n.includes("5x5")) return "⚡";
  return (["💪", "🎯", "🔥", "⚡", "🏆"] as const)[i % 5];
}

export default function WorkoutProgrammesSection({
  data,
}: {
  data: ProgrammesPageData;
}) {
  const [selection, setSelection] = useState<Programme | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const handleDemarrer = async (routineId: string, routineNom: string) => {
    try {
      const exercises = await getRoutineExercises(routineId);
      startWorkout({ routineId, routineName: routineNom, exercises });
    } catch {
      startWorkout({ routineId, routineName: routineNom });
    }
  };

  return (
    <div>
      {/* Programme actif */}
      {data.programmeActif && (
        <ActiveProgramme
          programme={data.programmeActif}
          onView={() => setSelection(data.programmeActif)}
          onStart={handleDemarrer}
        />
      )}

      {/* Mes programmes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[9px] font-bold tracking-[0.1em] uppercase"
            style={{ color: "#A8A29E" }}
          >
            Mes programmes
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-[9px] font-semibold"
            style={{ color: "#74bf7a" }}
          >
            + Créer
          </button>
        </div>

        {data.programmes.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelection(p)}
            className="w-full flex items-center gap-3.5 py-3 text-left active:opacity-80 transition-opacity"
            style={{ borderBottom: "1px solid rgba(74,55,40,0.08)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: "rgba(74,55,40,0.06)" }}
            >
              {getEmoji(p.nom, i)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-semibold truncate"
                style={{ color: "#4A3728" }}
              >
                {p.nom}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#78716C" }}>
                {p.routines.length} séances ·{" "}
                {p.id === data.programmeActif?.id
                  ? "En cours"
                  : (p.description ?? "Inactif")}
              </p>
            </div>
            <ChevronRight
              size={14}
              style={{ color: "#A8A29E", flexShrink: 0 }}
            />
          </button>
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="w-full py-3.5 rounded-2xl text-[11px] font-medium mt-3 active:opacity-70 transition-opacity"
          style={{
            border: "1.5px dashed rgba(74,55,40,0.2)",
            color: "#78716C",
          }}
        >
          + Créer un nouveau programme
        </button>
      </div>

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

function ActiveProgramme({
  programme,
  onView,
  onStart,
}: {
  programme: NonNullable<ProgrammesPageData["programmeActif"]>;
  onView: () => void;
  onStart: (routineId: string, routineNom: string) => void;
}) {
  const nextRoutine = programme.routines[0];
  const progress = programme.progres;
  const pct = progress
    ? Math.round((progress.semaine_actuelle / progress.total_semaines) * 100)
    : 0;

  return (
    <div
      className="mb-[18px] pb-3.5"
      style={{ borderBottom: "1px solid rgba(74,55,40,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex-1 text-[14px]"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "#4A3728",
          }}
        >
          {programme.nom}
        </span>
        <span
          className="text-[7px] font-extrabold tracking-[0.08em] uppercase px-2 py-[2px] rounded-lg text-white"
          style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
        >
          Actif
        </span>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex-1 h-[3px] rounded-full"
            style={{ background: "rgba(74,55,40,0.1)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #c4a882, #a0785c)",
              }}
            />
          </div>
          <span
            className="text-[9px] font-semibold shrink-0"
            style={{ color: "#78716C" }}
          >
            Sem. {progress.semaine_actuelle} / {progress.total_semaines}
          </span>
        </div>
      )}

      {/* Next routine CTA */}
      {nextRoutine && (
        <button
          onClick={() => onStart(nextRoutine.routine_id, nextRoutine.nom)}
          className="w-full rounded-xl p-2.5 px-3 flex items-center justify-between active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
        >
          <div className="flex flex-col gap-[2px]">
            <span className="text-[7px] font-extrabold tracking-[0.1em] uppercase text-white">
              ✦ Suivante
            </span>
            <span
              className="text-[13px] text-white"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
              }}
            >
              {nextRoutine.nom}
            </span>
            <span
              className="text-[9px]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {nextRoutine.nbExercices} exercices
            </span>
          </div>
          <span className="text-[9px] font-bold text-white shrink-0">
            Démarrer →
          </span>
        </button>
      )}
    </div>
  );
}
