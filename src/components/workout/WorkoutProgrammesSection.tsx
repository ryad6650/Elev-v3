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
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Mes programmes
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#74BF7A",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Créer
          </button>
        </div>

        {data.programmes.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelection(p)}
            className="w-full flex items-center gap-3.5 py-3 text-left active:opacity-80 transition-opacity"
            style={{
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              background: "none",
              border: "none",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              {getEmoji(p.nom, i)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {p.nom}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {p.routines.length} séances ·{" "}
                {p.id === data.programmeActif?.id
                  ? "En cours"
                  : (p.description ?? "Inactif")}
              </p>
            </div>
            <ChevronRight
              size={14}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
          </button>
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="w-full py-3.5 rounded-2xl mt-3 active:opacity-70 transition-opacity"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 12,
            fontWeight: 500,
            border: "1.5px dashed rgba(0,0,0,0.12)",
            color: "var(--text-muted)",
            background: "none",
            cursor: "pointer",
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
  void onView;
  const nextRoutine = programme.routines[0];
  const progress = programme.progres;
  const pct = progress
    ? Math.round((progress.semaine_actuelle / progress.total_semaines) * 100)
    : 0;

  return (
    <div style={{ marginBottom: 18 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex-1"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {programme.nom}
        </span>
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 9999,
            background: "#74BF7A",
            color: "#fff",
          }}
        >
          Actif
        </span>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex-1 overflow-hidden"
            style={{
              height: 5,
              borderRadius: 99,
              background: "rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 99,
                background: "#74BF7A",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            Sem. {progress.semaine_actuelle} / {progress.total_semaines}
          </span>
        </div>
      )}

      {/* Next routine CTA */}
      {nextRoutine && (
        <button
          onClick={() => onStart(nextRoutine.routine_id, nextRoutine.nom)}
          className="w-full rounded-xl p-3 flex items-center justify-between active:scale-[0.98] transition-transform"
          style={{
            background: "#74BF7A",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div className="flex flex-col gap-[2px]">
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Suivante
            </span>
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {nextRoutine.nom}
            </span>
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {nextRoutine.nbExercices} exercices
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            Démarrer →
          </span>
        </button>
      )}
    </div>
  );
}
