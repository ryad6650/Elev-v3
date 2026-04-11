"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FolderPlus,
  ClipboardList,
  Search,
  ChevronDown,
  X,
  Pencil,
  Share,
  Copy,
} from "lucide-react";

const RoutineDetailView = dynamic(() => import("./RoutineDetailView"), {
  ssr: false,
});
import { useWorkoutStore } from "@/store/workoutStore";
import { useUiStore } from "@/store/uiStore";
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
  const [viewRoutine, setViewRoutine] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  const openMenu = (routine: Routine) => {
    setMenuRoutine(routine);
    setFullscreenModal(true);
  };

  const closeMenu = () => {
    setMenuRoutine(null);
    setFullscreenModal(false);
  };

  const handleStartRoutine = async (routine: Routine) => {
    closeMenu();
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
      closeMenu();
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEdit = () => {
    const routine = menuRoutine;
    closeMenu();
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
            background: "#262220",
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
            background: "#262220",
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
              onView={() => setViewRoutine(routine)}
              onOptions={() => openMenu(routine)}
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

      {/* Menu options routine — bottom sheet */}
      {menuRoutine && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={closeMenu}
          />

          {/* Sheet */}
          <div
            className="relative rounded-t-[28px] pb-10 px-4"
            style={{ background: "#161618" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div
                className="w-10 h-[5px] rounded-full"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
            </div>

            {/* Titre */}
            <p
              className="text-center pb-4 truncate px-4"
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {menuRoutine.nom}
            </p>

            {/* Actions */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#262220" }}
            >
              <RoutineMenuItem
                icon={<Share size={22} />}
                label="Partager la routine"
                onClick={closeMenu}
              />
              <RoutineDivider />
              <RoutineMenuItem
                icon={<Copy size={22} />}
                label="Dupliquer la Routine"
                onClick={closeMenu}
              />
              <RoutineDivider />
              <RoutineMenuItem
                icon={<Pencil size={22} />}
                label="Modifier la Routine"
                onClick={handleOpenEdit}
              />
              <RoutineDivider />
              <button
                onClick={() => handleDelete(menuRoutine)}
                disabled={deleting}
                className="w-full flex items-center gap-5 px-5 py-4 active:opacity-60 transition-opacity disabled:opacity-40"
              >
                <X size={22} style={{ color: "#EF4444" }} />
                <span
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: 17,
                    fontWeight: 400,
                    color: "#EF4444",
                  }}
                >
                  {deleting ? "Suppression..." : "Supprimer la Routine"}
                </span>
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

      {viewRoutine && (
        <RoutineDetailView
          routine={viewRoutine}
          userName={data.prenom ?? "toi"}
          onBack={() => setViewRoutine(null)}
          onStart={() => {
            setViewRoutine(null);
            handleStartRoutine(viewRoutine);
          }}
          onEdit={() => {
            const r = viewRoutine;
            setViewRoutine(null);
            setEditRoutine(r);
          }}
        />
      )}
    </div>
  );
}

function RoutineMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-5 px-5 py-4 active:opacity-60 transition-opacity"
    >
      <span style={{ color: "var(--text-primary)" }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: 17,
          fontWeight: 400,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function RoutineDivider() {
  return (
    <div
      className="mx-5 h-px"
      style={{ background: "rgba(255,255,255,0.08)" }}
    />
  );
}
