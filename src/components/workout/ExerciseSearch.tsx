"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Plus, ChevronDown, PenLine } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { getUserExerciseRests } from "@/app/actions/routines";
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

// Badge couleur par équipement
// Cache résultats exercices (5 min TTL)
const exerciseCache = new Map<string, { data: Exercise[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const EQUIPEMENT_COLOR: Record<string, string> = {
  Barre: "#6366F1",
  Haltères: "#3B82F6",
  Machine: "#8B5CF6",
  "Poulie / Câble": "#06B6D4",
  "Poids du corps": "#22C55E",
  Corde: "#F59E0B",
  Kettlebell: "#EF4444",
  "Smith machine": "#EC4899",
  "Bande élastique": "#14B8A6",
};

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

  // Debounce saisie texte
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  // Fetch exercices avec cache 5 min
  const fetchExercises = useCallback(
    async (search: string, grp: string, equip: string) => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (grp) params.set("groupe", grp);
      if (equip) params.set("equipement", equip);
      const cacheKey = params.toString();

      const cached = exerciseCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setResults(cached.data);
        return;
      }

      setLoading(true);
      try {
        const r = await fetch(`/api/exercises?${params}`);
        const data: Exercise[] = await r.json();
        const list = Array.isArray(data) ? data : [];
        exerciseCache.set(cacheKey, { data: list, ts: Date.now() });
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
    } else {
      const restMap = await getUserExerciseRests([ex.id]);
      addExercise({
        exerciseId: ex.id,
        nom: ex.nom,
        groupeMusculaire: ex.groupe_musculaire,
        gifUrl: ex.gif_url,
        ordre: 0,
        seriesCible: 3,
        repsCible: 10,
        repsCibleMax: null,
        restDuration: restMap[ex.id] ?? null,
      });
      onClose();
    }
  };

  const handleCreated = (ex: Exercise) => {
    setShowCreate(false);
    handleAdd(ex);
  };

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="px-4 pb-4 border-b"
        style={{
          borderColor: "var(--border)",
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          background:
            "linear-gradient(180deg, rgba(232,134,12,0.06) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            <X size={18} style={{ color: "var(--text-primary)" }} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: "var(--accent-bg)",
              color: "var(--accent-text)",
            }}
          >
            <PenLine size={13} />
            Créer
          </button>
        </div>
        <h2
          className="text-2xl mb-1"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>

      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Recherche texte */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher un exercice..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
          />
          {q && (
            <button onClick={() => setQ("")}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* Filtres : Groupe musculaire + Équipement côte à côte */}
        <div className="flex gap-2">
          {/* Bouton Groupe musculaire */}
          <button
            onClick={() => {
              setShowGroupe(!showGroupe);
              setShowEquipement(false);
            }}
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: groupe
                ? "rgba(232,134,12,0.12)"
                : "var(--bg-elevated)",
              border: groupe
                ? "1px solid rgba(232,134,12,0.3)"
                : "1px solid var(--border)",
              color: groupe ? "var(--accent-text)" : "var(--text-secondary)",
            }}
          >
            <span className="truncate">{groupe || "Groupe musculaire"}</span>
            <ChevronDown
              size={14}
              className="shrink-0 ml-1"
              style={{
                transform: showGroupe ? "rotate(180deg)" : "none",
                transition: "200ms",
              }}
            />
          </button>

          {/* Bouton Équipement */}
          <button
            onClick={() => {
              setShowEquipement(!showEquipement);
              setShowGroupe(false);
            }}
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: equipement
                ? "rgba(232,134,12,0.12)"
                : "var(--bg-elevated)",
              border: equipement
                ? "1px solid rgba(232,134,12,0.3)"
                : "1px solid var(--border)",
              color: equipement
                ? "var(--accent-text)"
                : "var(--text-secondary)",
            }}
          >
            <span className="truncate">{equipement || "Équipement"}</span>
            <ChevronDown
              size={14}
              className="shrink-0 ml-1"
              style={{
                transform: showEquipement ? "rotate(180deg)" : "none",
                transition: "200ms",
              }}
            />
          </button>
        </div>

        {/* Dropdown Groupe musculaire */}
        {showGroupe && (
          <div className="flex flex-wrap gap-2 pb-1">
            {GROUPES.map((g) => {
              const active = groupe === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    setGroupe(active ? "" : g);
                    setShowGroupe(false);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg-elevated)",
                    color: active ? "white" : "var(--text-secondary)",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdown Équipement */}
        {showEquipement && (
          <div className="flex flex-wrap gap-2 pb-1">
            {EQUIPEMENTS.map((eq) => {
              const active = equipement === eq;
              const color = EQUIPEMENT_COLOR[eq] ?? "var(--text-secondary)";
              return (
                <button
                  key={eq}
                  onClick={() => {
                    setEquipement(active ? "" : eq);
                    setShowEquipement(false);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? color : "var(--bg-elevated)",
                    color: active ? "white" : "var(--text-secondary)",
                    border: active ? "none" : `1px solid ${color}40`,
                  }}
                >
                  {eq}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
        {/* Compteur résultats */}
        {!loading && results.length > 0 && (
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            {results.length} exercice{results.length > 1 ? "s" : ""}
          </p>
        )}

        {loading && (
          <p
            className="text-sm text-center mt-8"
            style={{ color: "var(--text-muted)" }}
          >
            Chargement...
          </p>
        )}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center gap-4 mt-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun exercice trouvé
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--accent-bg)",
                color: "var(--accent-text)",
                border: "1px solid var(--accent)",
              }}
            >
              <PenLine size={15} />
              Créer &quot;{q || "un exercice personnalisé"}&quot;
            </button>
          </div>
        )}

        {results.map((ex) => {
          const badgeColor =
            EQUIPEMENT_COLOR[ex.equipement ?? ""] ?? "var(--text-muted)";
          return (
            <button
              key={ex.id}
              onClick={() => handleAdd(ex)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-opacity active:opacity-70"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <ExerciseGif gifUrl={ex.gif_url} nom={ex.nom} size="sm" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {ex.nom}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ex.groupe_musculaire}
                  </span>
                  {ex.equipement && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${badgeColor}20`,
                        color: badgeColor,
                      }}
                    >
                      {ex.equipement}
                    </span>
                  )}
                </div>
              </div>
              <Plus
                size={18}
                className="shrink-0 ml-3"
                style={{ color: "var(--accent)" }}
              />
            </button>
          );
        })}
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
