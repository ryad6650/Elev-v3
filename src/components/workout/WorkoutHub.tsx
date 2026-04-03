"use client";

import { useState } from "react";
import { Play, Trash2, X, Pencil } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { useRouter } from "next/navigation";
import RoutineCard from "./RoutineCard";
import EditRoutineModal from "./EditRoutineModal";
import {
  getRoutineExercises,
  deleteRoutine,
  type RoutineExerciseData,
} from "@/app/actions/routines";
import type { WorkoutPageData, Routine } from "@/lib/workout";

const FILTRES = ["Tous", "Push / Pull", "Upper / Lower", "Full Body"];

function getCategorie(nom: string): string {
  const n = nom.toLowerCase();
  if (n.includes("push") || n.includes("pull")) return "Push / Pull";
  if (n.includes("upper") || n.includes("lower")) return "Upper / Lower";
  if (n.includes("full") || n.includes("corps") || n.includes("body"))
    return "Full Body";
  return "";
}

interface Props {
  data: WorkoutPageData;
}

export default function WorkoutHub({ data }: Props) {
  const router = useRouter();
  const [filtre, setFiltre] = useState("Tous");
  const [menuRoutine, setMenuRoutine] = useState<Routine | null>(null);
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exercisesCache, setExercisesCache] = useState<
    Record<string, RoutineExerciseData[]>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const routinesFiltrees =
    filtre === "Tous"
      ? data.routines
      : data.routines.filter((r) => getCategorie(r.nom) === filtre);

  const fetchExercises = async (routine: Routine) => {
    if (exercisesCache[routine.id]) return;
    setLoadingId(routine.id);
    try {
      const exs = await getRoutineExercises(routine.id);
      setExercisesCache((prev) => ({ ...prev, [routine.id]: exs }));
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleExpand = async (routine: Routine) => {
    if (expandedId === routine.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(routine.id);
    await fetchExercises(routine);
  };

  const handleStartRoutine = async (routine: Routine) => {
    setMenuRoutine(null);
    setExpandedId(null);
    try {
      const exercices =
        exercisesCache[routine.id] ?? (await getRoutineExercises(routine.id));
      startWorkout({
        routineId: routine.id,
        routineName: routine.nom,
        exercises: exercices,
      });
    } catch {
      startWorkout({ routineId: routine.id, routineName: routine.nom });
    }
  };

  const handleDelete = async (routine: Routine) => {
    setDeleting(true);
    try {
      await deleteRoutine(routine.id);
      setMenuRoutine(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEdit = () => {
    const routine = menuRoutine;
    setMenuRoutine(null);
    if (routine) setEditRoutine(routine);
  };

  return (
    <div>
      {/* Filtres */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 mb-5"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTRES.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${filtre === f ? "btn-accent" : ""}`}
            style={
              filtre === f
                ? undefined
                : {
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liste routines */}
      {routinesFiltrees.length > 0 && (
        <div className="space-y-3">
          {routinesFiltrees.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              index={data.routines.indexOf(routine)}
              onToggle={() => handleToggleExpand(routine)}
              onOptions={() => setMenuRoutine(routine)}
              onStart={() => handleStartRoutine(routine)}
              expanded={expandedId === routine.id}
              exercises={exercisesCache[routine.id] ?? []}
              loadingExpanded={loadingId === routine.id}
            />
          ))}
        </div>
      )}

      {data.routines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune routine. Appuie sur + pour créer ta première routine ou
            démarrer une séance libre.
          </p>
        </div>
      )}
      {routinesFiltrees.length === 0 && data.routines.length > 0 && (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune routine dans cette catégorie.
          </p>
        </div>
      )}

      {/* Menu options routine */}
      {menuRoutine && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center pb-[88px] px-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMenuRoutine(null)}
        >
          <div
            className="w-full max-w-[420px] px-4 pb-6 pt-4"
            style={{ background: "var(--bg-card)", borderRadius: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "var(--bg-elevated)" }}
            />
            <p
              className="text-center font-semibold mb-4 truncate px-4"
              style={{ color: "var(--text-primary)" }}
            >
              {menuRoutine.nom}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleStartRoutine(menuRoutine)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-sm"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, #000) 0%, var(--accent) 40%, var(--accent-text) 100%)`,
                  color: "white",
                }}
              >
                <Play size={16} fill="white" />
                Lancer cette routine
              </button>
              <button
                onClick={handleOpenEdit}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-sm"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                }}
              >
                <Pencil size={16} />
                Modifier la routine
              </button>
              <button
                onClick={() => handleDelete(menuRoutine)}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-sm disabled:opacity-50"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--danger)",
                }}
              >
                <Trash2 size={16} />
                {deleting ? "Suppression..." : "Supprimer la routine"}
              </button>
              <button
                onClick={() => setMenuRoutine(null)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={15} />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {editRoutine && (
        <EditRoutineModal
          routine={editRoutine}
          onClose={() => setEditRoutine(null)}
        />
      )}
    </div>
  );
}
