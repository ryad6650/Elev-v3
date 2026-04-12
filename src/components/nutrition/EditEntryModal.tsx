"use client";

import { useState, useEffect, useRef } from "react";
import FoodDetailSheet from "./FoodDetailSheet";
import NutriInfoForm from "./NutriInfoForm";
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
  const mountedRef = useRef(true);

  const isCustom = !!aliment.id && aliment.is_global === false;
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  useEffect(() => {
    mountedRef.current = true;
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    getFavoriteIds()
      .then((ids) => {
        if (mountedRef.current) setFavIds(new Set(ids));
      })
      .catch(() => {});
    return () => {
      mountedRef.current = false;
      document.body.style.overflow = "";
      setFullscreenModal(false);
    };
  }, [setFullscreenModal]);

  async function handleConfirm(
    quantite: number,
    quantitePortion: number | null,
  ) {
    if (pending) return;
    setPending(true);
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
      await Promise.all([
        updatePromise,
        updateEntryAlimentId(entry.id, aliment.id),
      ]);
    } else {
      await updatePromise;
    }

    onClose();
  }

  async function handleToggleFavorite() {
    if (!aliment.id) return;
    const prev = favIds;
    const next = new Set(favIds);
    if (next.has(aliment.id)) next.delete(aliment.id);
    else next.add(aliment.id);
    setFavIds(next);
    try {
      await toggleFavoriteAliment(aliment.id);
    } catch {
      if (mountedRef.current) setFavIds(prev);
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
      <NutriInfoForm
        editAliment={aliment}
        onEdited={handleEdited}
        onCreated={handleCreated}
        onBack={() => setStep("detail")}
        onClose={onClose}
      />
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
