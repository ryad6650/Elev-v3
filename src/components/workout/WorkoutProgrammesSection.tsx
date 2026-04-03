"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ProgrammeDetail from "@/components/programmes/ProgrammeDetail";
import CreateProgrammeModal from "@/components/programmes/CreateProgrammeModal";
import { getRoutineExercises } from "@/app/actions/routines";
import { useWorkoutStore } from "@/store/workoutStore";
import type { ProgrammesPageData, Programme } from "@/lib/programmes";

const LETTRES = ["A", "B", "C", "D", "E"];

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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Programme actif
            </p>
            <button
              onClick={() => setSelection(data.programmeActif)}
              className="text-xs font-semibold"
              style={{ color: "var(--accent-text)" }}
            >
              Tout voir
            </button>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--bg-secondary)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <h3
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {data.programmeActif.nom}
              </h3>
              <span className="btn-accent text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ml-3">
                Actif
              </span>
            </div>
            {data.programmeActif.progres && (
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Semaine {data.programmeActif.progres.semaine_actuelle} de{" "}
                {data.programmeActif.progres.total_semaines} ·{" "}
                {data.programmeActif.routines.length} séances/sem
              </p>
            )}

            <div
              className="flex gap-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {data.programmeActif.routines.map((r, i) => (
                <div
                  key={r.routine_id}
                  className="shrink-0 rounded-xl p-3 flex flex-col"
                  style={{
                    minWidth: 148,
                    background:
                      i === 0
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "var(--bg-card)",
                    border: `1px solid ${i === 0 ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--border)"}`,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                    style={{
                      color:
                        i === 0 ? "var(--accent-text)" : "var(--text-muted)",
                    }}
                  >
                    {i === 0 ? "✦ SUIVANTE" : `SÉANCE ${LETTRES[i]}`}
                  </p>
                  <p
                    className="text-sm font-bold mb-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.nom}
                  </p>
                  <p
                    className="text-xs mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.nbExercices} exercices
                  </p>
                  {i === 0 && (
                    <button
                      onClick={() => handleDemarrer(r.routine_id, r.nom)}
                      className="mt-auto w-full py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, #000) 0%, var(--accent) 40%, var(--accent-text) 100%)`,
                      }}
                    >
                      Démarrer →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mes programmes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Mes programmes
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-xs font-semibold"
            style={{ color: "var(--accent-text)" }}
          >
            + Créer
          </button>
        </div>

        {data.programmes.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelection(p)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl mb-2 text-left transition-all active:scale-[0.99]"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: "var(--bg-elevated)" }}
            >
              {getEmoji(p.nom, i)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {p.nom}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.routines.length} séances ·{" "}
                {p.id === data.programmeActif?.id
                  ? "En cours"
                  : (p.description ?? "Inactif")}
              </p>
            </div>
            <ChevronRight
              size={16}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
          </button>
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:opacity-70"
          style={{
            background: "transparent",
            border: "1.5px dashed rgba(255,255,255,0.12)",
            color: "var(--text-muted)",
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
