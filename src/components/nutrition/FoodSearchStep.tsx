"use client";

import { useState } from "react";
import { Search, ScanBarcode, X, Plus } from "lucide-react";
import FoodSearchResults from "./FoodSearchResults";
import type { NutritionAliment } from "@/lib/nutrition-utils";

const CATS = [
  { id: "all", emoji: "✦", label: "Tous", mots: [] as string[] },
  {
    id: "legumes",
    emoji: "🥬",
    label: "Légumes",
    mots: [
      "carotte",
      "brocoli",
      "épinard",
      "tomate",
      "courgette",
      "haricot",
      "salade",
      "poivron",
      "oignon",
      "champignon",
      "concombre",
      "poireau",
    ],
  },
  {
    id: "fruits",
    emoji: "🍎",
    label: "Fruits",
    mots: [
      "pomme",
      "banane",
      "orange",
      "fraise",
      "raisin",
      "pêche",
      "poire",
      "abricot",
      "cerise",
      "citron",
      "ananas",
      "mangue",
      "kiwi",
    ],
  },
  {
    id: "viandes",
    emoji: "🥩",
    label: "Viandes",
    mots: [
      "boeuf",
      "poulet",
      "porc",
      "veau",
      "agneau",
      "dinde",
      "canard",
      "jambon",
      "lardons",
      "saucisse",
      "steak",
    ],
  },
  {
    id: "poissons",
    emoji: "🐟",
    label: "Poissons",
    mots: [
      "saumon",
      "thon",
      "cabillaud",
      "sole",
      "sardine",
      "maquereau",
      "dorade",
      "truite",
      "crevette",
    ],
  },
  {
    id: "laitiers",
    emoji: "🧀",
    label: "Laitiers",
    mots: [
      "lait",
      "yaourt",
      "fromage",
      "beurre",
      "crème",
      "cottage",
      "ricotta",
      "mozzarella",
      "skyr",
    ],
  },
  {
    id: "feculents",
    emoji: "🌾",
    label: "Féculents",
    mots: [
      "riz",
      "pâtes",
      "pain",
      "pomme de terre",
      "quinoa",
      "lentille",
      "pois chiche",
      "avoine",
      "semoule",
    ],
  },
] as const;

type TabId = "resultats" | "recents" | "favoris";
type CatId = (typeof CATS)[number]["id"];

interface Props {
  query: string;
  setQuery: (q: string) => void;
  results: NutritionAliment[];
  recents: NutritionAliment[];
  populaires: NutritionAliment[];
  favoris: NutritionAliment[];
  favoriteIds: Set<string>;
  loading: boolean;
  loadingInitial: boolean;
  onSelect: (a: NutritionAliment) => void;
  onToggleFavorite: (a: NutritionAliment) => void;
  onScan: () => void;
  onCustom: () => void;
}

function filterByCat(items: NutritionAliment[], catId: CatId) {
  if (catId === "all") return items;
  const cat = CATS.find((c) => c.id === catId);
  if (!cat || cat.mots.length === 0) return items;
  return items.filter((a) =>
    cat.mots.some((m) => a.nom.toLowerCase().includes(m)),
  );
}

export default function FoodSearchStep({
  query,
  setQuery,
  results,
  recents,
  populaires,
  favoris,
  favoriteIds,
  loading,
  loadingInitial,
  onSelect,
  onToggleFavorite,
  onScan,
  onCustom,
}: Props) {
  const [tab, setTab] = useState<TabId>(query ? "resultats" : "recents");
  const [cat, setCat] = useState<CatId>("all");

  function handleQueryChange(val: string) {
    setQuery(val);
    setTab(val.trim().length >= 1 ? "resultats" : "recents");
  }

  const recentsOrPop = recents.length > 0 ? recents : populaires;
  const recentsLabel = recents.length > 0 ? "Récents" : "Populaires";

  const q = query.trim().toLowerCase();
  const instant: NutritionAliment[] =
    q.length >= 1
      ? [...recents, ...populaires]
          .filter(
            (a, i, arr) =>
              arr.findIndex((x) => x.id === a.id && x.id !== "") === i,
          )
          .filter((a) => a.nom.toLowerCase().includes(q))
          .slice(0, 8)
      : [];

  const list =
    tab === "resultats"
      ? results.length > 0
        ? results
        : instant
      : tab === "recents"
        ? recentsOrPop
        : favoris;
  const display = filterByCat(list, cat);
  const emptyMsg =
    tab === "favoris"
      ? "Aucun favori"
      : tab === "recents"
        ? loadingInitial
          ? "Chargement..."
          : "Aucun aliment récent"
        : "Aucun résultat";

  const TABS: { id: TabId; label: string }[] = [
    { id: "resultats", label: "Résultats" },
    { id: "recents", label: recentsLabel },
    { id: "favoris", label: "Favoris" },
  ];

  return (
    <div
      className="flex flex-col gap-2.5 px-4 pb-6 overflow-y-auto"
      style={
        {
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties
      }
    >
      {/* Search bar */}
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 rounded-[14px] h-[42px] px-3"
          style={{
            background: "var(--bg-card)",
            border: query
              ? "1px solid var(--accent)"
              : "1px solid var(--border)",
            boxShadow: query ? "0 0 0 3px var(--accent-bg)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          <Search size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Rechercher un aliment…"
            className="bg-transparent flex-1 text-[13px] outline-none min-w-0"
            style={{ color: "var(--text-primary)" }}
          />
          {query && (
            <button
              onClick={() => {
                handleQueryChange("");
                setTab("recents");
              }}
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--border)" }}
            >
              <X size={10} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
        <button
          onClick={onScan}
          className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <ScanBarcode size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Segmented tabs */}
      <div
        className="flex rounded-[10px] p-[3px]"
        style={{ background: "var(--border)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 text-center text-[10px] font-semibold py-1.5 rounded-lg transition-colors"
            style={{
              background: tab === t.id ? "var(--bg-card)" : "transparent",
              color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {CATS.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => setCat(id as CatId)}
            className="flex items-center gap-1 px-2.5 py-[5px] rounded-full whitespace-nowrap text-[10px] font-semibold shrink-0 transition-colors"
            style={{
              background: cat === id ? "var(--accent-bg)" : "var(--bg-card)",
              color:
                cat === id ? "var(--accent-text)" : "var(--text-secondary)",
              border:
                cat === id
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
            }}
          >
            <span className="text-[11px]">{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && display.length > 0 && (
        <p
          className="text-[9px] font-bold uppercase px-0.5"
          style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
        >
          {display.length} {tab === "favoris" ? "favori" : "résultat"}
          {display.length > 1 ? "s" : ""}
        </p>
      )}

      <FoodSearchResults
        results={display}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
        favoriteIds={favoriteIds}
        loading={
          loading &&
          tab === "resultats" &&
          instant.length === 0 &&
          results.length === 0
        }
        emptyMessage={emptyMsg}
      />

      {/* Custom food button */}
      <button
        onClick={onCustom}
        className="flex items-center gap-2.5 rounded-[14px] active:opacity-70 transition-opacity"
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border)",
          padding: "12px 14px",
        }}
      >
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent)",
          }}
        >
          <Plus size={16} style={{ color: "var(--accent-text)" }} />
        </div>
        <div>
          <p
            className="text-[11px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Créer un aliment personnalisé
          </p>
          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {query ? `Pas trouvé « ${query} » ?` : "Ajouter vos propres macros"}
          </p>
        </div>
      </button>
    </div>
  );
}
