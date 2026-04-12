"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProchaineRoutine } from "@/lib/dashboard";
import { useWorkoutStore } from "@/store/workoutStore";
import { getRoutineExercises } from "@/app/actions/routines";

interface Props {
  routine: ProchaineRoutine | null;
}

export default function DashboardNextRoutine({ routine }: Props) {
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [isStarting, setIsStarting] = useState(false);

  if (!routine)
    return (
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 14,
          }}
        >
          Prochaine seance
        </div>
        <div
          style={{
            background: "#262220",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "24px 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏋️</p>
          <p
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 14,
              color: "var(--text-secondary)",
              marginBottom: 14,
            }}
          >
            Aucune routine planifiée — crée ta première routine pour commencer !
          </p>
          <a
            href="/programmes"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: 12,
              background: "#74BF7A",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-nunito), sans-serif",
              textDecoration: "none",
            }}
          >
            Créer une routine
          </a>
        </div>
      </div>
    );

  const exerciceText = routine.exerciceNoms.join(", ");

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const exercices = await getRoutineExercises(routine.id);
      startWorkout({
        routineId: routine.id,
        routineName: routine.nom,
        exercises: exercices,
      });
      router.push("/workout");
    } catch {
      startWorkout({ routineId: routine.id, routineName: routine.nom });
      router.push("/workout");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: 14,
        }}
      >
        Prochaine seance
      </div>

      <div
        style={{
          background: "#262220",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        {/* Titre */}
        <p
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            marginBottom: 8,
          }}
        >
          {routine.nom}
        </p>

        {/* Apercu exercices */}
        {exerciceText && (
          <p
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {exerciceText}
          </p>
        )}

        {/* Bouton Commencer */}
        <button
          onClick={handleStart}
          disabled={isStarting}
          className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 ${isStarting ? "scale-[0.97] opacity-80" : "active:scale-[0.97]"}`}
          style={{
            background: "#74BF7A",
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            color: "white",
            border: "none",
          }}
        >
          {isStarting ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="animate-spin rounded-full border-2"
                style={{
                  width: 16,
                  height: 16,
                  borderColor: "rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                }}
              />
              Chargement...
            </span>
          ) : (
            "Commencer la Routine"
          )}
        </button>
      </div>
    </div>
  );
}
