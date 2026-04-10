"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FolderPlus,
  ClipboardList,
  Search,
  ChevronDown,
  Trash2,
  X,
  Pencil,
  Play,
} from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { useRouter } from "next/navigation";
import RoutineCard from "./RoutineCard";
import { getRoutineExercises, deleteRoutine } from "@/app/actions/routines";
import type { WorkoutPageData, Routine } from "@/lib/workout";

const EditRoutineModal = dynamic(() => import("./EditRoutineModal"), {
  ssr: false,
});

interface Props {
  data: WorkoutPageData;
  onNewRoutine: () => void;
  onExplorer: () => void;
}

export default function WorkoutHub({ data, onNewRoutine, onExplorer }: Props) {
  const router = useRouter();
  const [mesRoutinesOpen, setMesRoutinesOpen] = useState(true);
  const [menuRoutine, setMenuRoutine] = useState<Routine | null>(null);
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const handleStartRoutine = async (routine: Routine) => {
    setMenuRoutine(null);
    try {
      const exercices = await getRoutineExercises(routine.id);
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
      {/* Routines header */}
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Routines
        </span>
        <button onClick={onNewRoutine} className="active:opacity-70 p-1">
          <FolderPlus size={22} style={{ color: "var(--text-primary)" }} />
        </button>
      </div>

      {/* Nouv. Routine + Explorer */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={onNewRoutine}
          className="flex-1 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: "#1C1C1E",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <ClipboardList size={18} style={{ color: "var(--text-primary)" }} />
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Nouv. Routine
          </span>
        </button>
        <button
          onClick={onExplorer}
          className="flex-1 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: "#1C1C1E",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <Search size={18} style={{ color: "var(--text-primary)" }} />
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Explorer
          </span>
        </button>
      </div>

      {/* Mes routines collapsible header */}
      <button
        onClick={() => setMesRoutinesOpen((v) => !v)}
        className="flex items-center gap-1.5 mb-3 active:opacity-70"
      >
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{
            color: "var(--text-secondary)",
            transform: mesRoutinesOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          Mes routines ({data.routines.length})
        </span>
      </button>

      {mesRoutinesOpen && data.routines.length > 0 && (
        <div className="space-y-3">
          {data.routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onOptions={() => setMenuRoutine(routine)}
              onStart={() => handleStartRoutine(routine)}
            />
          ))}
        </div>
      )}

      {data.routines.length === 0 && (
        <div className="text-center py-16">
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            Aucune routine. Appuie sur + pour créer ta première routine.
          </p>
        </div>
      )}

      {/* Menu options routine */}
      {menuRoutine && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center pb-[88px] px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMenuRoutine(null)}
        >
          <div
            className="w-full max-w-[420px] px-4 pb-6 pt-4 rounded-[20px]"
            style={{
              background: "linear-gradient(to bottom, #e8e6e2, #f3f0ea)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ background: "rgba(0,0,0,0.08)" }}
            />
            <p
              className="text-center font-semibold mb-4 truncate px-4"
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                color: "#1C1917",
              }}
            >
              {menuRoutine.nom}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleStartRoutine(menuRoutine)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-sm"
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                }}
              >
                <Play size={16} fill="white" />
                Lancer cette routine
              </button>
              <button
                onClick={handleOpenEdit}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-sm"
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  background: "rgba(255,255,255,0.5)",
                  color: "#1C1917",
                  border: "none",
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
                  fontFamily: "var(--font-nunito), sans-serif",
                  background: "rgba(255,255,255,0.5)",
                  color: "#c94444",
                  border: "none",
                }}
              >
                <Trash2 size={16} />
                {deleting ? "Suppression..." : "Supprimer la routine"}
              </button>
              <button
                onClick={() => setMenuRoutine(null)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm"
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  color: "#78716C",
                  background: "none",
                  border: "none",
                }}
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
