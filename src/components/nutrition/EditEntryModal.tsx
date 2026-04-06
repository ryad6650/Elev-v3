"use client";

import { useState, useEffect } from "react";
import FoodDetailSheet from "./FoodDetailSheet";
import CustomFoodForm from "./CustomFoodForm";
import { useNutritionStore } from "@/store/nutritionStore";
import {
  toggleFavoriteAliment,
  getFavoriteIds,
  updateEntryAlimentId,
} from "@/app/actions/nutrition";
import type { NutritionEntry, NutritionAliment } from "@/lib/nutrition-utils";

interface Props {
  entry: NutritionEntry;
  onClose: (needsRefresh?: boolean) => void;
}

export default function EditEntryModal({ entry, onClose }: Props) {
  const updateEntry = useNutritionStore((s) => s.updateEntry);
  const [pending, setPending] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"detail" | "edit">("detail");
  const [aliment, setAliment] = useState<NutritionAliment>(entry.aliment);

  const isCustom = !!aliment.id && aliment.is_global === false;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    getFavoriteIds()
      .then((ids) => setFavIds(new Set(ids)))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleConfirm(
    quantite: number,
    quantitePortion: number | null,
  ) {
    if (pending) return;
    const alimentChanged = aliment.id !== entry.aliment.id;

    // L'optimistic update dans updateEntry est synchrone (début de la fonction)
    // → on lance la promesse sans attendre pour fermer le modal immédiatement
    const updatePromise = updateEntry(entry.id, quantite, quantitePortion);

    if (alimentChanged) {
      // Si l'aliment a changé, attendre la synchro serveur avant de fermer
      setPending(true);
      await Promise.all([
        updatePromise,
        updateEntryAlimentId(entry.id, aliment.id),
      ]);
    }

    onClose(alimentChanged);
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[430px] px-3 mb-24 flex flex-col">
        <div
          className="rounded-3xl flex flex-col w-full pt-2"
          style={{
            background: "var(--bg-secondary)",
            maxHeight: "calc(100dvh - 165px - env(safe-area-inset-top, 20px))",
          }}
        >
          {step === "detail" && (
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
          )}

          {step === "edit" && (
            <CustomFoodForm
              editAliment={isCustom ? aliment : { ...aliment, id: "" }}
              isForking={!isCustom}
              onEdited={handleEdited}
              onCreated={handleCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
