"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { X, Camera, Search } from "lucide-react";
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
  initialFrequents?: NutritionAliment[];
  onClose: () => void;
}

const MEAL_NAMES: Record<number, string> = {
  1: "Petit-déjeuner",
  2: "Déjeuner",
  3: "Collation",
  4: "Dîner",
};
const MEAL_PLACEHOLDERS: Record<number, string> = {
  1: "Qu'avez-vous mangé ce matin ?",
  2: "Qu'avez-vous mangé à midi ?",
  3: "Quelle collation avez-vous prise ?",
  4: "Qu'avez-vous mangé ce soir ?",
};

export default function AddFoodModal({
  mealNumber,
  mealTime,
  date,
  initialFrequents = [],
  onClose,
}: Props) {
  const addEntry = useNutritionStore((s) => s.addEntry);

  const [step, setStep] = useState<Step>("search");
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastUsed, setLastUsed] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NutritionAliment[]>([]);
  const [recents, setRecents] = useState<NutritionAliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NutritionAliment | null>(null);
  const [populaires, setPopulaires] =
    useState<NutritionAliment[]>(initialFrequents);
  const [favoris, setFavoris] = useState<NutritionAliment[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [pending, setPending] = useState(false);

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    const t = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
      setFullscreenModal(false);
    };
  }, [setFullscreenModal]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getRecentAliments().catch(() => [] as NutritionAliment[]),
      getFavoriteAliments().catch(() => [] as NutritionAliment[]),
    ]).then(([r, favAliments]) => {
      if (ignore) return;
      setRecents(r as NutritionAliment[]);
      const aliments = favAliments as NutritionAliment[];
      setFavoris(aliments);
      setFavoriteIds(new Set(aliments.map((a) => a.id)));
      setLoadingInitial(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aliments?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setResults([]);
        return;
      }
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
      if (!res.ok) {
        setQuery(code);
        return;
      }
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

  async function handleQuickAdd(aliment: NutritionAliment) {
    if (pending) return;
    setPending(true);
    try {
      const qty = lastUsed[aliment.id] ?? aliment.taille_portion_g ?? 100;
      let alimentId = aliment.id;
      if (!alimentId && aliment.source === "openfoodfacts") {
        const { id } = await upsertExternalAliment(aliment);
        alimentId = id;
      }
      addEntry(mealNumber, aliment, alimentId, qty, date, mealTime, null);
      setLastUsed((prev) => ({ ...prev, [alimentId]: qty }));
      setSessionCount((c) => c + 1);
    } finally {
      setPending(false);
    }
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
      addEntry(
        mealNumber,
        selected,
        alimentId,
        quantite,
        date,
        mealTime,
        quantitePortion,
      );
      setLastUsed((prev) => ({ ...prev, [alimentId]: quantite }));
      setSessionCount((c) => c + 1);
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
    useNutritionStore.getState().updateAlimentInEntries(updated.id, updated);
  }

  async function handleToggleFavorite(aliment: NutritionAliment) {
    if (!aliment.id) return;
    const isFav = favoriteIds.has(aliment.id);
    const next = new Set(favoriteIds);
    if (isFav) {
      next.delete(aliment.id);
      setFavoris((p) => p.filter((f) => f.id !== aliment.id));
    } else {
      next.add(aliment.id);
      setFavoris((p) => [aliment, ...p]);
    }
    setFavoriteIds(next);
    try {
      await toggleFavoriteAliment(aliment.id);
    } catch {
      setFavoriteIds(favoriteIds);
      if (isFav) setFavoris((p) => [aliment, ...p]);
      else setFavoris((p) => p.filter((f) => f.id !== aliment.id));
    }
  }

  function handleClose() {
    setIsClosing(true);
    setTimeout(onClose, 320);
  }

  const isCustom = selected?.is_global === false && !!selected?.id;
  const mealLabel = MEAL_NAMES[mealNumber] ?? `Repas ${mealNumber}`;
  const isBeige = step === "custom" || step === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: isBeige ? "var(--bg-gradient)" : "#111927",
        transform:
          isClosing || !isVisible ? "translateY(100%)" : "translateY(0)",
        opacity: isClosing ? 0 : isVisible ? 1 : 0,
        transition: isVisible
          ? "transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease"
          : "none",
      }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col relative">
        {/* En-tête */}
        {step !== "quantity" && (
          <div
            className="flex items-center justify-between px-5 shrink-0 pb-3"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "transparent", border: "2px solid #3B82F6" }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: "#3B82F6", fontFamily: "var(--font-sans)" }}
              >
                {sessionCount}
              </span>
            </div>
            <p
              className="text-[17px] font-bold"
              style={{
                color: isBeige ? "#2C1E14" : "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {step === "custom"
                ? "Aliment personnalisé"
                : step === "edit"
                  ? isCustom
                    ? "Modifier"
                    : "Corriger"
                  : mealLabel}
            </p>
            <button
              onClick={isBeige ? () => setStep("search") : handleClose}
              className="w-9 h-9 flex items-center justify-center active:opacity-70 transition-opacity"
            >
              <X
                size={20}
                style={{ color: isBeige ? "#78716C" : "var(--text-secondary)" }}
              />
            </button>
          </div>
        )}

        {/* Étapes */}
        {step === "scan" && (
          <div className="px-4 pb-6 flex-1">
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
            placeholder={MEAL_PLACEHOLDERS[mealNumber]}
            onSelect={handleSelect}
            onQuickAdd={handleQuickAdd}
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

        {/* Bouton Terminé + barre bas — flottant au-dessus de la liste */}
        {(step === "search" || step === "scan") && (
          <>
            {/* Bouton Terminé flottant */}
            <div
              className="absolute left-0 right-0 px-4"
              style={{
                bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 64px)",
              }}
            >
              <button
                onClick={handleClose}
                className="w-full py-4 rounded-full font-bold text-[17px] active:scale-[0.98] transition-transform"
                style={{
                  background: "#3B82F6",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Terminé
              </button>
            </div>

            {/* Barre de navigation bas */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                background: "#181B1B",
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                paddingTop: 8,
              }}
            >
              <div className="flex justify-around">
                <button
                  onClick={() => setStep("scan")}
                  className="flex flex-col items-center gap-1 py-1 px-6 active:opacity-70 transition-opacity"
                >
                  <Camera
                    size={22}
                    style={{
                      color: step === "scan" ? "#3B82F6" : "var(--text-muted)",
                    }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color: step === "scan" ? "#3B82F6" : "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Appareil photo IA
                  </span>
                </button>
                <button
                  onClick={() => setStep("search")}
                  className="flex flex-col items-center gap-1 py-1 px-6 active:opacity-70 transition-opacity"
                >
                  <Search
                    size={22}
                    style={{
                      color:
                        step === "search"
                          ? "var(--accent-text)"
                          : "var(--text-muted)",
                    }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color:
                        step === "search"
                          ? "var(--accent-text)"
                          : "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Recherche
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
