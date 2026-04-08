"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  getRecentAliments,
  getFavoriteAliments,
  toggleFavoriteAliment,
  upsertExternalAliment,
} from "@/app/actions/nutrition";
import FoodSearchStep from "./FoodSearchStep";
import FoodDetailSheet from "./FoodDetailSheet";
import CustomFoodForm from "./CustomFoodForm";
import { useNutritionStore } from "@/store/nutritionStore";
import { useUiStore } from "@/store/uiStore";
import type { NutritionAliment } from "@/lib/nutrition-utils";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), {
  ssr: false,
});

type Step = "search" | "scan" | "quantity" | "custom" | "edit";

interface Props {
  mealNumber: number;
  mealTime: string;
  date: string;
  onClose: () => void;
}

export default function AddFoodModal({
  mealNumber,
  mealTime,
  date,
  onClose,
}: Props) {
  const addEntry = useNutritionStore((s) => s.addEntry);
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NutritionAliment[]>([]);
  const [recents, setRecents] = useState<NutritionAliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NutritionAliment | null>(null);
  const [populaires, setPopulaires] = useState<NutritionAliment[]>([]);
  const [favoris, setFavoris] = useState<NutritionAliment[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [pending, setPending] = useState(false);

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    return () => {
      document.body.style.overflow = "";
      setFullscreenModal(false);
    };
  }, [setFullscreenModal]);

  useEffect(() => {
    Promise.all([
      getRecentAliments().catch(() => [] as NutritionAliment[]),
      fetch("/api/aliments?q=")
        .then((r) => r.json())
        .then((d) => (Array.isArray(d) ? d : []))
        .catch(() => []),
      getFavoriteAliments().catch(() => [] as NutritionAliment[]),
    ]).then(([r, pop, favAliments]) => {
      setRecents(r as NutritionAliment[]);
      setPopulaires(pop);
      const aliments = favAliments as NutritionAliment[];
      setFavoris(aliments);
      setFavoriteIds(new Set(aliments.map((a: NutritionAliment) => a.id)));
      setLoadingInitial(false);
    });
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aliments?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  async function handleBarcode(code: string) {
    setStep("search");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/aliments?barcode=${encodeURIComponent(code)}`,
      );
      const data: NutritionAliment[] = await res.json();
      if (data.length > 0) handleSelect(data[0]);
      else setQuery(code);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(aliment: NutritionAliment) {
    setSelected(aliment);
    setStep("quantity");
  }

  async function handleConfirm(
    quantite: number,
    quantitePortion: number | null,
  ) {
    if (!selected || pending) return;
    setPending(true);

    try {
      let alimentId = selected.id;
      if (!alimentId && selected.source === "openfoodfacts") {
        const { id } = await upsertExternalAliment(selected);
        alimentId = id;
      }

      // Lancer l'optimistic update (immédiat dans le store) + sync Supabase en arrière-plan
      addEntry(
        mealNumber,
        selected,
        alimentId,
        quantite,
        date,
        mealTime,
        quantitePortion,
      );
      // Fermer immédiatement — l'entrée est déjà visible via l'optimistic update
      onClose();
    } finally {
      setPending(false);
    }
  }

  function handleCustomCreated(aliment: NutritionAliment) {
    setSelected(aliment);
    setStep("quantity");
  }

  function handleEdited(updated: NutritionAliment) {
    setSelected(updated);
    setStep("quantity");
    // Mise à jour instantanée de l'aliment dans le store
    useNutritionStore.getState().updateAlimentInEntries(updated.id, updated);
  }

  async function handleToggleFavorite(aliment: NutritionAliment) {
    if (!aliment.id) return;
    const isFav = favoriteIds.has(aliment.id);
    // Optimiste
    const next = new Set(favoriteIds);
    if (isFav) {
      next.delete(aliment.id);
      setFavoris((prev) => prev.filter((f) => f.id !== aliment.id));
    } else {
      next.add(aliment.id);
      setFavoris((prev) => [aliment, ...prev]);
    }
    setFavoriteIds(next);
    try {
      await toggleFavoriteAliment(aliment.id);
    } catch {
      // Rollback
      setFavoriteIds(favoriteIds);
      if (isFav) setFavoris((prev) => [aliment, ...prev]);
      else setFavoris((prev) => prev.filter((f) => f.id !== aliment.id));
    }
  }

  const isCustom = selected?.is_global === false && !!selected?.id;
  const MEAL_NAMES: Record<number, string> = {
    1: "Petit-déjeuner",
    2: "Déjeuner",
    3: "Collation",
    4: "Dîner",
  };
  const mealLabel = MEAL_NAMES[mealNumber] ?? `Repas ${mealNumber}`;

  const today = new Date().toISOString().split("T")[0];
  const dateLabel =
    date === today
      ? "Aujourd'hui"
      : new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });

  const isBeige = step === "custom" || step === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: isBeige ? "#F2E8D5" : "var(--bg-primary)" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        <div className="flex flex-col w-full h-full">
          {step !== "quantity" && (
            <div
              className="flex items-center justify-between px-5 pb-3.5 shrink-0"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
            >
              <button
                onClick={isBeige ? () => setStep("search") : onClose}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
                style={{
                  background: isBeige ? "rgba(0,0,0,0.05)" : "var(--bg-card)",
                  border: isBeige
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "1px solid var(--border)",
                }}
              >
                <X
                  size={14}
                  style={{
                    color: isBeige ? "#78716C" : "var(--text-secondary)",
                  }}
                />
              </button>
              <p
                className="text-xl leading-none"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                  color: isBeige ? "#2C1E14" : "var(--text-primary)",
                }}
              >
                {step === "custom"
                  ? "Aliment personnalisé"
                  : step === "edit"
                    ? isCustom
                      ? "Modifier"
                      : "Corriger"
                    : "Ajouter un aliment"}
              </p>
              {step === "search" ? (
                <span
                  className="text-[9px] font-bold rounded-lg px-2.5 py-1"
                  style={{
                    background: "var(--accent-bg)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent-text)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {mealLabel}
                </span>
              ) : (
                <div className="w-[30px]" />
              )}
            </div>
          )}

          {step === "scan" && (
            <div className="px-4 pb-6">
              <BarcodeScanner
                onDetected={handleBarcode}
                onClose={() => setStep("search")}
              />
            </div>
          )}

          {step === "search" && (
            <FoodSearchStep
              query={query}
              setQuery={setQuery}
              results={results}
              recents={recents}
              populaires={populaires}
              favoris={favoris}
              favoriteIds={favoriteIds}
              loading={loading}
              loadingInitial={loadingInitial}
              onSelect={handleSelect}
              onToggleFavorite={handleToggleFavorite}
              onScan={() => setStep("scan")}
              onCustom={() => setStep("custom")}
            />
          )}

          {step === "quantity" && selected && (
            <FoodDetailSheet
              aliment={selected}
              mealLabel={mealLabel}
              onBack={() => setStep("search")}
              onConfirm={handleConfirm}
              onEdit={() => setStep("edit")}
              pending={pending}
              isFavorite={!!selected.id && favoriteIds.has(selected.id)}
              onToggleFavorite={
                selected.id ? () => handleToggleFavorite(selected) : undefined
              }
            />
          )}

          {step === "custom" && (
            <CustomFoodForm onCreated={handleCustomCreated} />
          )}

          {step === "edit" && selected && (
            <CustomFoodForm
              editAliment={isCustom ? selected : { ...selected, id: "" }}
              isForking={!isCustom}
              onEdited={handleEdited}
              onCreated={handleCustomCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
