"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, Plus, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { createRoutine } from "@/app/actions/workout";
import ExerciseSearch from "./ExerciseSearch";
import RoutineExerciseCard from "./RoutineExerciseCard";
import type { RoutineExercise } from "./RoutineExerciseCard";
import { getGroupeColor } from "./exerciseColors";
import { useUiStore } from "@/store/uiStore";

interface RawExercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  gif_url: string | null;
}

const STORAGE_KEY = "elev-draft-routine";
const DRAFT_TTL = 5 * 60 * 1000; // 5 minutes

interface DraftRoutine {
  nom: string;
  exercices: RoutineExercise[];
  savedAt: number;
}

function loadDraft(): DraftRoutine | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft: DraftRoutine = JSON.parse(raw);
    if (Date.now() - draft.savedAt > DRAFT_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(nom: string, exercices: RoutineExercise[]) {
  if (!nom && exercices.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const draft: DraftRoutine = { nom, exercices, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  onClose: () => void;
}

export default function CreateRoutineModal({ onClose }: Props) {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [nom, setNom] = useState(draft?.nom ?? "");
  const [exercices, setExercices] = useState<RoutineExercise[]>(
    draft?.exercices ?? [],
  );
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

  // Masquer la bottom nav
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  useEffect(() => {
    setFullscreenModal(true);
    return () => setFullscreenModal(false);
  }, [setFullscreenModal]);

  // Sauvegarder le brouillon à chaque changement
  useEffect(() => {
    saveDraft(nom, exercices);
  }, [nom, exercices]);

  const handleSelect = useCallback((ex: RawExercise) => {
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
    setShowSearch(false);
  }, []);

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

  const updateReps = (i: number, v: string) => {
    const n = parseInt(v);
    if (v === "" || (!isNaN(n) && n >= 0))
      setExercices((p) =>
        p.map((e, idx) =>
          idx === i ? { ...e, repsCible: isNaN(n) ? 0 : n } : e,
        ),
      );
  };

  const updateRepsMax = (i: number, v: string) => {
    const n = parseInt(v);
    if (v === "" || (!isNaN(n) && n >= 0))
      setExercices((p) =>
        p.map((e, idx) =>
          idx === i ? { ...e, repsCibleMax: isNaN(n) ? 0 : n } : e,
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
      await createRoutine(
        nom.trim(),
        exercices.map((e, i) => ({
          exerciseId: e.exerciseId,
          seriesCible: e.seriesCible,
          repsCible: e.repsCible,
          repsCibleMax: e.repsCibleMax,
          ordre: i,
        })),
      );
      clearDraft();
      router.refresh();
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue");
      setSaving(false);
    }
  };

  if (showSearch)
    return (
      <ExerciseSearch
        onClose={() => setShowSearch(false)}
        onSelect={handleSelect}
      />
    );

  const totalSeries = exercices.reduce((s, e) => s + e.seriesCible, 0);
  const groupes = [...new Set(exercices.map((e) => e.groupeMusculaire))];

  return (
    <div
      className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)", height: "100dvh" }}
    >
      {/* Header */}
      <div
        className="px-4 pb-4 border-b"
        style={{
          borderColor: "var(--border)",
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
            Créer une routine
          </span>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !nom.trim()}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "white",
            }}
          >
            {saving ? "Création..." : "Créer"}
          </button>
        </div>
        <input
          autoFocus
          type="text"
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            setErreur("");
          }}
          placeholder="Nom de la routine"
          className="w-full bg-transparent outline-none mb-3"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
            fontSize: "24px",
            lineHeight: "1.2",
          }}
        />
        {erreur && (
          <p className="text-xs mt-1 mb-2" style={{ color: "var(--danger)" }}>
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
        {exercices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Dumbbell
              size={40}
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun exercice ajouté
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
            onUpdateReps={updateReps}
            onUpdateRepsMax={updateRepsMax}
            onToggleRepsMode={toggleReps}
            onMove={move}
            onRemove={remove}
          />
        ))}
        <button
          onClick={() => setShowSearch(true)}
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
      </div>
    </div>
  );
}
