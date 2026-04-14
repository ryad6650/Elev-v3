"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, TrendingUp, ChevronDown } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import {
  getUserExerciseSettings,
  getExerciseLastRefs,
} from "@/app/actions/routines";
import CreateExerciseModal from "./CreateExerciseModal";
import ExerciseGif from "./ExerciseGif";

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url: string | null;
}

interface Props {
  onClose: () => void;
  onSelect?: (ex: Exercise) => void;
  title?: string;
}

const GROUPES = [
  "Pectoraux",
  "Dos",
  "Épaules",
  "Biceps",
  "Triceps",
  "Abdominaux",
  "Quadriceps",
  "Ischio-jambiers",
  "Fessiers",
  "Mollets",
  "Avant-bras",
];
const EQUIPEMENTS = [
  "Barre",
  "Haltères",
  "Machine",
  "Poulie / Câble",
  "Poids du corps",
  "Corde",
  "Kettlebell",
  "Smith machine",
  "Bande élastique",
];
const exerciseCache = new Map<string, { data: Exercise[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX_SIZE = 100;

const settingsCache = new Map<
  string,
  Promise<
    [
      Record<string, { restDuration: number | null; notes: string }>,
      Record<string, { poids: number | null; reps: number | null }>,
    ]
  >
>();

export default function ExerciseSearch({
  onClose,
  onSelect,
  title = "Ajouter un exercice",
}: Props) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [groupe, setGroupe] = useState("");
  const [equipement, setEquipement] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGroupe, setShowGroupe] = useState(false);
  const [showEquipement, setShowEquipement] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const fetchExercises = useCallback(
    async (search: string, grp: string, equip: string) => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (grp) params.set("groupe", grp);
      if (equip) params.set("equipement", equip);
      const key = params.toString();
      const hit = exerciseCache.get(key);
      if (hit && Date.now() - hit.ts < CACHE_TTL) {
        setResults(hit.data);
        return;
      }
      setLoading(true);
      try {
        const r = await fetch(`/api/exercises?${params}`);
        const data: Exercise[] = await r.json();
        const list = Array.isArray(data) ? data : [];
        if (exerciseCache.size >= CACHE_MAX_SIZE) {
          const oldest = exerciseCache.keys().next().value;
          if (oldest !== undefined) exerciseCache.delete(oldest);
        }
        exerciseCache.set(key, { data: list, ts: Date.now() });
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchExercises(debouncedQ, groupe, equipement);
  }, [debouncedQ, groupe, equipement, fetchExercises]);

  const handleAdd = async (ex: Exercise) => {
    if (onSelect) {
      onSelect(ex);
      return;
    }
    if (!settingsCache.has(ex.id)) {
      settingsCache.set(
        ex.id,
        Promise.all([
          getUserExerciseSettings([ex.id]),
          getExerciseLastRefs([ex.id]),
        ]),
      );
    }
    const [sMap, rMap] = await settingsCache.get(ex.id)!;
    const s = sMap[ex.id];
    addExercise({
      exerciseId: ex.id,
      nom: ex.nom,
      groupeMusculaire: ex.groupe_musculaire,
      gifUrl: ex.gif_url,
      ordre: 0,
      seriesCible: 3,
      repsCible: 10,
      repsCibleMax: null,
      restDuration: s?.restDuration ?? null,
      notes: s?.notes ?? "",
      poidsRef: rMap[ex.id]?.poids ?? null,
      repsRef: rMap[ex.id]?.reps ?? null,
    });
    onClose();
  };

  const handleCreated = (ex: Exercise) => {
    setShowCreate(false);
    handleAdd(ex);
  };
  const suggested = !q ? results.slice(0, 5) : results;
  const recents = !q ? results.slice(5) : [];

  return (
    <div
      className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col"
      style={{ background: "#1B1715" }}
    >
      {/* Header iOS */}
      <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={onClose}
            className="active:opacity-60"
            style={{ color: "#1E9D4C", fontSize: 17 }}
          >
            Annuler
          </button>
          <span
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: 600,
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            {title}
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="active:opacity-60"
            style={{ color: "#1E9D4C", fontSize: 17 }}
          >
            Créer
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-4 pt-1 pb-3 space-y-3">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#262220" }}
        >
          <Search size={17} style={{ color: "#636366" }} />
          <input
            autoFocus
            type="text"
            placeholder="Chercher un exercice"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              color: "#fff",
              fontSize: 17,
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          />
          {q && (
            <button onClick={() => setQ("")}>
              <X size={15} style={{ color: "#636366" }} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <FilterBtn
            label="Tous les Équipements"
            value={equipement}
            open={showEquipement}
            onToggle={() => {
              setShowEquipement(!showEquipement);
              setShowGroupe(false);
            }}
          />
          <FilterBtn
            label="Tous les Muscles"
            value={groupe}
            open={showGroupe}
            onToggle={() => {
              setShowGroupe(!showGroupe);
              setShowEquipement(false);
            }}
          />
        </div>

        {showEquipement && (
          <FilterDropdown
            items={EQUIPEMENTS}
            selected={equipement}
            onSelect={(v) => {
              setEquipement(v === equipement ? "" : v);
              setShowEquipement(false);
            }}
          />
        )}
        {showGroupe && (
          <FilterDropdown
            items={GROUPES}
            selected={groupe}
            onSelect={(v) => {
              setGroupe(v === groupe ? "" : v);
              setShowGroupe(false);
            }}
          />
        )}
      </div>

      {/* Results */}
      <div
        className="flex-1 overflow-y-auto pb-10"
        style={{ scrollbarWidth: "none" }}
      >
        {loading && (
          <p className="text-sm text-center mt-12" style={{ color: "#636366" }}>
            Chargement...
          </p>
        )}
        {!loading && results.length === 0 && (
          <p className="text-sm text-center mt-12" style={{ color: "#636366" }}>
            Aucun exercice trouvé
          </p>
        )}
        {!loading && results.length > 0 && (
          <>
            <SectionLabel label={q ? "Résultats" : "Exercices suggérés"} />
            {suggested.map((ex) => (
              <ExerciseRow key={ex.id} ex={ex} onSelect={() => handleAdd(ex)} />
            ))}
            {recents.length > 0 && (
              <>
                <SectionLabel label="Exercices Récents" />
                {recents.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    ex={ex}
                    onSelect={() => handleAdd(ex)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateExerciseModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pt-5 pb-2" style={{ color: "#636366", fontSize: 14 }}>
      {label}
    </p>
  );
}

function FilterBtn({
  label,
  value,
  open,
  onToggle,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl active:opacity-70"
      style={{ background: "#262220" }}
    >
      <span
        className="truncate"
        style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
      >
        {value || label}
      </span>
      <ChevronDown
        size={14}
        className="shrink-0 ml-1"
        style={{
          color: "#636366",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 200ms",
        }}
      />
    </button>
  );
}

function FilterDropdown({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold active:opacity-70"
          style={{
            background: selected === item ? "#1E9D4C" : "#2C2C2E",
            color: "#fff",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ExerciseRow({ ex, onSelect }: { ex: Exercise; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 px-4 py-3 mx-4 rounded-xl active:opacity-60"
      style={{
        background: "#262220",
        width: "calc(100% - 2rem)",
        marginBottom: 8,
      }}
    >
      <ExerciseGif gifUrl={ex.gif_url} nom={ex.nom} size="md" circle />
      <div className="flex-1 min-w-0 text-left">
        <p
          className="truncate"
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          {ex.nom}
        </p>
        <p style={{ color: "#636366", fontSize: 14, marginTop: 2 }}>
          {ex.groupe_musculaire}
        </p>
      </div>
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 30, height: 30, border: "1.5px solid #3A3A3C" }}
      >
        <TrendingUp size={13} style={{ color: "#8E8E93" }} />
      </div>
    </button>
  );
}
