import { useState, useCallback } from "react";
import type { RoutineExercise } from "@/components/workout/RoutineExerciseCard";

export interface RawExercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  gif_url: string | null;
}

export function useRoutineExercises(initial: RoutineExercise[] = []) {
  const [exercices, setExercices] = useState<RoutineExercise[]>(initial);

  const addExercise = useCallback((ex: RawExercise) => {
    setExercices((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        nom: ex.nom,
        groupeMusculaire: ex.groupe_musculaire,
        gifUrl: ex.gif_url,
        seriesCible: 3,
        repsCible: 10,
        repsCibleMax: null,
      },
    ]);
  }, []);

  const updateSeries = useCallback((i: number, d: number) => {
    setExercices((p) =>
      p.map((e, idx) =>
        idx === i ? { ...e, seriesCible: Math.max(1, e.seriesCible + d) } : e,
      ),
    );
  }, []);

  const toggleReps = useCallback((i: number) => {
    setExercices((p) =>
      p.map((e, idx) =>
        idx !== i
          ? e
          : e.repsCibleMax !== null
            ? { ...e, repsCibleMax: null }
            : { ...e, repsCibleMax: e.repsCible + 4 },
      ),
    );
  }, []);

  const updateIntField = useCallback(
    (i: number, field: "repsCible" | "repsCibleMax", v: string) => {
      const n = parseInt(v);
      if (v === "" || (!isNaN(n) && n >= 0))
        setExercices((p) =>
          p.map((e, idx) =>
            idx === i ? { ...e, [field]: isNaN(n) ? 0 : n } : e,
          ),
        );
    },
    [],
  );

  const remove = useCallback((i: number) => {
    setExercices((p) => p.filter((_, idx) => idx !== i));
  }, []);

  const move = useCallback((i: number, dir: -1 | 1) => {
    setExercices((p) => {
      const t = i + dir;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });
  }, []);

  const replaceExercise = useCallback((i: number, ex: RawExercise) => {
    setExercices((p) =>
      p.map((e, idx) =>
        idx === i
          ? {
              exerciseId: ex.id,
              nom: ex.nom,
              groupeMusculaire: ex.groupe_musculaire,
              gifUrl: ex.gif_url,
              seriesCible: e.seriesCible,
              repsCible: e.repsCible,
              repsCibleMax: e.repsCibleMax,
            }
          : e,
      ),
    );
  }, []);

  return {
    exercices,
    setExercices,
    addExercise,
    updateSeries,
    toggleReps,
    updateIntField,
    remove,
    move,
    replaceExercise,
  };
}
