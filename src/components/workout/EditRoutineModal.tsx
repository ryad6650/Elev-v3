"use client";

import { useState, useEffect } from "react";
import { X, Plus, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateRoutine, getRoutineExercises } from "@/app/actions/workout";
import ExerciseSearch from "./ExerciseSearch";
import EditExerciseModal from "./EditExerciseModal";
import ExerciseEditMenu from "./ExerciseEditMenu";
import RoutineExerciseCard from "./RoutineExerciseCard";
import type { RoutineExercise } from "./RoutineExerciseCard";
import { getGroupeColor } from "./exerciseColors";
import type { Routine } from "@/lib/workout";

interface RawExercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  gif_url: string | null;
}
interface Props {
  routine: Routine;
  onClose: () => void;
}

export default function EditRoutineModal({ routine, onClose }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState(routine.nom);
  const [exercices, setExercices] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

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
  }, [routine.id]);

  const handleSelect = (ex: RawExercise) => {
    if (replaceIndex !== null) {
      setExercices((p) =>
        p.map((e, i) =>
          i === replaceIndex
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
      setReplaceIndex(null);
    } else {
      setExercices((p) => [
        ...p,
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

  const updateSeries = (i: number, d: number) =>
    setExercices((p) =>
      p.map((e, idx) =>
        idx === i ? { ...e, seriesCible: Math.max(1, e.seriesCible + d) } : e,
      ),
    );
  const toggleReps = (i: number) =>
    setExercices((p) =>
      p.map((e, idx) =>
        idx !== i
          ? e
          : e.repsCibleMax !== null
            ? { ...e, repsCibleMax: null }
            : { ...e, repsCibleMax: e.repsCible + 4 },
      ),
    );
  const updateIntField = (
    i: number,
    field: "repsCible" | "repsCibleMax",
    v: string,
  ) => {
    const n = parseInt(v);
    if (v === "" || (!isNaN(n) && n >= 0))
      setExercices((p) =>
        p.map((e, idx) =>
          idx === i ? { ...e, [field]: isNaN(n) ? 0 : n } : e,
        ),
      );
  };
  const remove = (i: number) =>
    setExercices((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= exercices.length) return;
    setExercices((p) => {
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });
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
      className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)", height: "100dvh" }}
    >
      {/* Header */}
      <div
        className="px-4 pb-5 border-b"
        style={{
          borderColor: "var(--border)",
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          background:
            "linear-gradient(180deg, rgba(232,134,12,0.06) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            <X size={18} style={{ color: "var(--text-primary)" }} />
          </button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !nom.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 4px 20px rgba(232,134,12,0.3)",
            }}
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
          className="w-full text-3xl font-bold bg-transparent outline-none mb-1"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
            fontSize: "16px",
          }}
        />
        <h2
          className="text-[11px] uppercase tracking-wider font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Modifier la séance
        </h2>
        {erreur && (
          <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
            {erreur}
          </p>
        )}
        {exercices.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
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
            onUpdateReps={(i, v) => updateIntField(i, "repsCible", v)}
            onUpdateRepsMax={(i, v) => updateIntField(i, "repsCibleMax", v)}
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
              borderColor: "rgba(232,134,12,0.3)",
              color: "var(--accent)",
              background: "rgba(232,134,12,0.06)",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Ajouter un exercice
          </button>
        )}
      </div>

      {/* Modal édition exercice */}
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
