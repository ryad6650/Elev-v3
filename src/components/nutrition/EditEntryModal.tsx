"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import FoodDetailSheet from "./FoodDetailSheet";
import CustomFoodForm from "./CustomFoodForm";
import { useNutritionStore } from "@/store/nutritionStore";
import { useUiStore } from "@/store/uiStore";
import {
  toggleFavoriteAliment,
  getFavoriteIds,
  updateEntryAlimentId,
} from "@/app/actions/nutrition";
import type { NutritionEntry, NutritionAliment } from "@/lib/nutrition-utils";

interface Props {
  entry: NutritionEntry;
  onClose: () => void;
}

export default function EditEntryModal({ entry, onClose }: Props) {
  const updateEntry = useNutritionStore((s) => s.updateEntry);
  const [pending, setPending] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"detail" | "edit">("detail");
  const [aliment, setAliment] = useState<NutritionAliment>(entry.aliment);

  const isCustom = !!aliment.id && aliment.is_global === false;
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    getFavoriteIds()
      .then((ids) => setFavIds(new Set(ids)))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
      setFullscreenModal(false);
    };
  }, [setFullscreenModal]);

  async function handleConfirm(
    quantite: number,
    quantitePortion: number | null,
  ) {
    if (pending) return;
    const alimentChanged = aliment.id !== entry.aliment.id;

    // Si l'aliment a changé (fork), mettre à jour le store AVANT updateEntry
    // pour que le spread dans l'optimistic update préserve le nouvel aliment
    if (alimentChanged) {
      useNutritionStore.setState((s) => ({
        entries: s.entries.map((e) =>
          e.id === entry.id ? { ...e, aliment } : e,
        ),
      }));
    }

    const updatePromise = updateEntry(entry.id, quantite, quantitePortion);

    if (alimentChanged) {
      setPending(true);
      await Promise.all([
        updatePromise,
        updateEntryAlimentId(entry.id, aliment.id),
      ]);
    }

    onClose();
  }

  async function handleToggleFavorite() {
    if (!aliment.id) return;
    const next = new Set(favIds);
    if (next.has(aliment.id)) next.delete(aliment.id);
    else next.add(aliment.id);
    setFavIds(next);
    try {
      await toggleFavoriteAliment(aliment.id);
    } catch {
      setFavIds(favIds);
    }
  }

  function handleEdited(updated: NutritionAliment) {
    setAliment(updated);
    setStep("detail");
    // Mise à jour instantanée de l'aliment dans toutes les entrées du store
    useNutritionStore.getState().updateAlimentInEntries(updated.id, updated);
  }

  function handleCreated(created: NutritionAliment) {
    // Fork : revenir à la vue détail avec le nouvel aliment, sans enregistrer dans le repas
    setAliment(created);
    setStep("detail");
  }

  if (step === "edit") {
    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ background: "#F2E8D5" }}
      >
        <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <button
              onClick={() => setStep("detail")}
              className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ChevronLeft size={14} style={{ color: "#78716C" }} />
            </button>
            <p
              className="text-xl leading-none"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                color: "#2C1E14",
              }}
            >
              {isCustom ? "Modifier" : "Corriger"}
            </p>
            <div className="w-[30px]" />
          </div>
          <div
            className="flex-1 overflow-y-auto min-h-0"
            style={
              {
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              } as React.CSSProperties
            }
          >
            <CustomFoodForm
              editAliment={isCustom ? aliment : { ...aliment, id: "" }}
              isForking={!isCustom}
              onEdited={handleEdited}
              onCreated={handleCreated}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FoodDetailSheet
      aliment={aliment}
      mealLabel={`Repas ${entry.meal_number}`}
      onBack={onClose}
      onConfirm={handleConfirm}
      onEdit={() => setStep("edit")}
      pending={pending}
      initialQuantity={entry.quantite_g}
      initialPortionQty={entry.quantite_portion}
      confirmLabel={
        aliment.id !== entry.aliment.id
          ? "Enregistrer les modifications"
          : "Modifier la quantité"
      }
      isFavorite={!!aliment.id && favIds.has(aliment.id)}
      onToggleFavorite={aliment.id ? handleToggleFavorite : undefined}
    />
  );
}
