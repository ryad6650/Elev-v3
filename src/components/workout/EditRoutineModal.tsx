"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateRoutine, getRoutineExercises } from "@/app/actions/routines";
import ExerciseSearch from "./ExerciseSearch";
import EditExerciseModal from "./EditExerciseModal";
import ExerciseEditMenu from "./ExerciseEditMenu";
import RoutineExerciseCard from "./RoutineExerciseCard";
import { getGroupeColor } from "./exerciseColors";
import { useUiStore } from "@/store/uiStore";
import { useRoutineExercises } from "@/hooks/useRoutineExercises";
import type { RawExercise } from "@/hooks/useRoutineExercises";
import type { Routine } from "@/lib/workout";

interface Props {
  routine: Routine;
  onClose: () => void;
}

export default function EditRoutineModal({ routine, onClose }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState(routine.nom);
  const {
    exercices,
    setExercices,
    addExercise,
    replaceExercise,
    updateSeries,
    toggleReps,
    updateIntField,
    remove,
    move,
  } = useRoutineExercises([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  useEffect(() => {
    setFullscreenModal(true);
    return () => setFullscreenModal(false);
  }, [setFullscreenModal]);

  useEffect(() => {
    getRoutineExercises(routine.id)
      .then((data) =>
        setExercices(
          data.map((e) => ({
            exerciseId: e.exerciseId,
            nom: e.nom,
            groupeMusculaire: e.groupeMusculaire,
            gifUrl: e.gifUrl,
            seriesCible: e.seriesCible,
            repsCible: e.repsCible,
            repsCibleMax: e.repsCibleMax,
          })),
        ),
      )
      .finally(() => setLoading(false));
  }, [routine.id, setExercices]);

  const handleSelect = (ex: RawExercise) => {
    if (replaceIndex !== null) {
      replaceExercise(replaceIndex, ex);
      setReplaceIndex(null);
    } else {
      addExercise(ex);
    }
    setShowSearch(false);
  };

  const handleExerciseUpdated = (ex: {
    id: string;
    nom: string;
    groupe_musculaire: string;
    gif_url: string | null;
  }) => {
    if (editIndex === null) return;
    setExercices((p) =>
      p.map((e, i) =>
        i === editIndex
          ? {
              ...e,
              nom: ex.nom,
              groupeMusculaire: ex.groupe_musculaire,
              gifUrl: ex.gif_url,
            }
          : e,
      ),
    );
    setEditIndex(null);
  };

  const handleSave = async () => {
    if (!nom.trim()) {
      setErreur("Donne un nom à ta routine.");
      return;
    }
    setSaving(true);
    try {
      await updateRoutine(
        routine.id,
        nom.trim(),
        exercices.map((e, i) => ({
          exerciseId: e.exerciseId,
          seriesCible: e.seriesCible,
          repsCible: e.repsCible,
          repsCibleMax: e.repsCibleMax,
          ordre: i,
        })),
      );
      router.refresh();
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue");
      setSaving(false);
    }
  };

  if (showSearch) {
    return (
      <ExerciseSearch
        onClose={() => {
          setShowSearch(false);
          setReplaceIndex(null);
        }}
        onSelect={handleSelect}
        title={
          replaceIndex !== null
            ? "Modifier l'exercice actuel"
            : "Ajouter un exercice"
        }
      />
    );
  }

  const totalSeries = exercices.reduce((s, e) => s + e.seriesCible, 0);
  const groupes = [...new Set(exercices.map((e) => e.groupeMusculaire))];

  const renderEditMenu = (i: number) => (
    <ExerciseEditMenu
      isOpen={menuIndex === i}
      onToggle={() => setMenuIndex(menuIndex === i ? null : i)}
      onEdit={() => {
        setMenuIndex(null);
        setEditIndex(i);
      }}
      onReplace={() => {
        setMenuIndex(null);
        setReplaceIndex(i);
        setShowSearch(true);
      }}
      onClose={() => setMenuIndex(null)}
    />
  );

  return (
    <div
      className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col overflow-hidden"
      style={{ background: "var(--bg-gradient)", height: "100dvh" }}
    >
      {/* Header */}
      <div
        className="px-4 pb-4 border-b"
        style={{
          borderColor: "rgba(0,0,0,0.06)",
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-lg active:scale-95"
          >
            <ChevronLeft size={22} style={{ color: "var(--text-primary)" }} />
          </button>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Modifier la routine
          </span>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !nom.trim()}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
        <input
          type="text"
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            setErreur("");
          }}
          placeholder="Nom de la routine"
          className="w-full bg-transparent outline-none mb-3"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontSize: "24px",
            lineHeight: "1.2",
          }}
        />
        {erreur && (
          <p className="text-xs mt-1 mb-2" style={{ color: "#c94444" }}>
            {erreur}
          </p>
        )}
        {exercices.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {groupes.map((g) => {
              const c = getGroupeColor(g);
              return (
                <span
                  key={g}
                  className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ background: c.bg, color: c.text }}
                >
                  {g}
                </span>
              );
            })}
            <span
              className="text-[11px] ml-auto"
              style={{ color: "var(--text-muted)" }}
            >
              {exercices.length} exo{exercices.length > 1 ? "s" : ""} ·{" "}
              {totalSeries} série{totalSeries > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Liste */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 pb-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading && (
          <p
            className="text-sm text-center py-12"
            style={{ color: "var(--text-muted)" }}
          >
            Chargement...
          </p>
        )}
        {!loading && exercices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Dumbbell
              size={40}
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun exercice
            </p>
          </div>
        )}
        {exercices.map((ex, i) => (
          <RoutineExerciseCard
            key={`${ex.exerciseId}-${i}`}
            ex={ex}
            index={i}
            total={exercices.length}
            onUpdateSeries={updateSeries}
            onUpdateReps={(idx, v) => updateIntField(idx, "repsCible", v)}
            onUpdateRepsMax={(idx, v) => updateIntField(idx, "repsCibleMax", v)}
            onToggleRepsMode={toggleReps}
            onMove={move}
            onRemove={remove}
            extraActions={renderEditMenu(i)}
          />
        ))}
        {!loading && (
          <button
            onClick={() => {
              setReplaceIndex(null);
              setShowSearch(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] border-2 border-dashed"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
              color: "var(--accent)",
              background: "color-mix(in srgb, var(--accent) 6%, transparent)",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Ajouter un exercice
          </button>
        )}
      </div>

      {editIndex !== null && exercices[editIndex] && (
        <EditExerciseModal
          exercise={{
            id: exercices[editIndex].exerciseId,
            nom: exercices[editIndex].nom,
            groupe_musculaire: exercices[editIndex].groupeMusculaire,
            equipement: null,
            gif_url: exercices[editIndex].gifUrl,
          }}
          onClose={() => setEditIndex(null)}
          onUpdated={handleExerciseUpdated}
        />
      )}
    </div>
  );
}
