"use client";

import { useState, useEffect } from "react";
import { Plus, Dumbbell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateRoutine, getRoutineExercises } from "@/app/actions/routines";
import ExerciseSearch from "./ExerciseSearch";
import EditExerciseModal from "./EditExerciseModal";
import ExerciseEditMenu from "./ExerciseEditMenu";
import RoutineExerciseCard from "./RoutineExerciseCard";
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
      onRemove={() => {
        setMenuIndex(null);
        remove(i);
      }}
      onClose={() => setMenuIndex(null)}
    />
  );

  return (
    <div
      className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col overflow-hidden"
      style={{ background: "#000000", height: "100dvh" }}
    >
      {/* Header iOS-style */}
      <div
        className="relative flex items-center px-4 pb-3"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          background: "#151312",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={onClose}
          className="text-left active:opacity-60 transition-opacity shrink-0 z-10"
        >
          <span className="text-[17px]" style={{ color: "#1E9D4C" }}>
            Annuler
          </span>
        </button>
        <span
          className="absolute inset-x-0 text-center text-[17px] font-semibold pointer-events-none"
          style={{ color: "var(--text-primary)" }}
        >
          Modifier la routine
        </span>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving || !nom.trim()}
          className="whitespace-nowrap px-4 py-1.5 rounded-xl text-[15px] font-semibold active:opacity-70 transition-opacity disabled:opacity-40 z-10"
          style={{ background: "#1E9D4C", color: "white" }}
        >
          {saving ? "..." : "Mettre à jour"}
        </button>
      </div>

      {/* Routine name */}
      <div className="flex items-center gap-3 px-4 py-4">
        <input
          type="text"
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            setErreur("");
          }}
          placeholder="Nom de la routine"
          className="flex-1 bg-transparent outline-none"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontSize: "22px",
            lineHeight: "1.2",
          }}
        />
        {nom && (
          <button
            onClick={() => setNom("")}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 active:opacity-70 transition-opacity"
            style={{ background: "#48484A" }}
          >
            <X size={13} color="white" />
          </button>
        )}
      </div>
      {erreur && (
        <p className="text-xs px-4 -mt-2 mb-2" style={{ color: "#EF4444" }}>
          {erreur}
        </p>
      )}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Liste */}
      <div
        className="flex-1 min-h-0 overflow-y-auto pb-6"
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
          <div className="px-4 pt-1 pb-6">
            <button
              onClick={() => {
                setReplaceIndex(null);
                setShowSearch(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[15px] font-semibold transition-all active:opacity-70"
              style={{
                background: "#1E9D4C",
                color: "white",
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Ajouter un exercice
            </button>
          </div>
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
