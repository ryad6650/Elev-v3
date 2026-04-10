"use client";

import { useState } from "react";
import { Search, ScanBarcode, X, Plus } from "lucide-react";
import FoodSearchResults from "./FoodSearchResults";
import type { NutritionAliment } from "@/lib/nutrition-utils";

type TabId = "frequents" | "recents" | "favoris";

const TILES = [
  { emoji: "🥕", label: "Aliments" },
  { emoji: "🍱", label: "Repas" },
  { emoji: "👨‍🍳", label: "Recettes" },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "frequents", label: "Fréquents" },
  { id: "recents", label: "Récents" },
  { id: "favoris", label: "Favoris" },
];

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
  placeholder?: string;
  onSelect: (a: NutritionAliment) => void;
  onQuickAdd: (a: NutritionAliment) => void;
  onToggleFavorite: (a: NutritionAliment) => void;
  onScan: () => void;
  onCustom: () => void;
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
  placeholder,
  onSelect,
  onQuickAdd,
  onToggleFavorite,
  onScan,
  onCustom,
}: Props) {
  const [tab, setTab] = useState<TabId>("frequents");
  const [tile, setTile] = useState("Aliments");
  const q = query.trim().toLowerCase();

  const frequentsList = q ? results : populaires;
  const recentsList = q
    ? recents.filter((a) => a.nom.toLowerCase().includes(q))
    : recents;
  const favorisList = q
    ? favoris.filter((a) => a.nom.toLowerCase().includes(q))
    : favoris;

  const list =
    tab === "frequents"
      ? frequentsList
      : tab === "recents"
        ? recentsList
        : favorisList;
  const emptyMsg =
    tab === "favoris"
      ? "Aucun favori"
      : tab === "recents"
        ? loadingInitial
          ? "Chargement…"
          : "Aucun récent"
        : "Aucun résultat";
  const isSearchLoading =
    loading && tab === "frequents" && !!q && results.length === 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Barre de recherche */}
      <div className="px-4 pb-4">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 h-[50px]"
          style={{
            background: "#262828",
            border: "2px solid #3B82F6",
            boxShadow: q ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
            transition: "box-shadow 0.2s",
          }}
        >
          <Search size={17} color="#3B82F6" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ?? "Rechercher un aliment…"}
            autoFocus
            className="flex-1 bg-transparent outline-none"
            style={{
              color: "var(--text-primary)",
              fontSize: 16,
              fontFamily: "var(--font-sans)",
            }}
          />
          {q ? (
            <button
              onClick={() => setQuery("")}
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--bg-elevated)" }}
            >
              <X size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          ) : (
            <button
              onClick={onScan}
              className="shrink-0 active:opacity-60 transition-opacity"
            >
              <ScanBarcode size={20} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Tuiles catégories — masquées en cours de saisie */}
      {!q && (
        <div className="px-4 pb-4 flex gap-3">
          {TILES.map((tile_item) => (
            <div
              key={tile_item.label}
              onClick={() => setTile(tile_item.label)}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-5 active:scale-95 transition-transform"
              style={{
                background: tile === tile_item.label ? "#384250" : "#262828",
                border: "1px solid var(--border)",
                cursor: "pointer",
                aspectRatio: "1",
              }}
            >
              <span style={{ fontSize: 28 }}>{tile_item.emoji}</span>
              <span
                className="text-[12px] font-medium"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {tile_item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="px-4 pb-3">
        <div
          className="flex rounded-xl p-1 gap-0.5"
          style={{ background: "#1F2A37" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-[10px] text-[12px] font-semibold transition-colors"
              style={{
                background: tab === t.id ? "#384250" : "#1F2A37",
                color:
                  tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste aliments */}
      <div
        className="flex-1 overflow-y-auto px-4"
        style={
          {
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 160,
          } as React.CSSProperties
        }
      >
        <FoodSearchResults
          results={list}
          onSelect={onSelect}
          onQuickAdd={onQuickAdd}
          onToggleFavorite={onToggleFavorite}
          favoriteIds={favoriteIds}
          loading={isSearchLoading}
          emptyMessage={emptyMsg}
        />

        {/* Créer aliment personnalisé */}
        <button
          onClick={onCustom}
          className="w-full flex items-center gap-3 py-4 active:opacity-70 transition-opacity"
          style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <Plus size={15} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="text-left">
            <p
              className="text-sm font-semibold"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Créer un aliment personnalisé
            </p>
            <p
              className="text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {query
                ? `"${query}" introuvable ?`
                : "Ajouter vos propres macros"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
