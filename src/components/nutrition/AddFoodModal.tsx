"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  addNutritionEntry,
  getRecentAliments,
  upsertExternalAliment,
} from "@/app/actions/nutrition";
import FoodSearchStep from "./FoodSearchStep";
import FoodDetailSheet from "./FoodDetailSheet";
import CustomFoodForm from "./CustomFoodForm";
import BarcodeScanner from "./BarcodeScanner";
import { useNutritionStore } from "@/store/nutritionStore";
import type { NutritionAliment } from "@/lib/nutrition-utils";

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
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let done = 0;
    const finish = () => {
      done++;
      if (done >= 2) setLoadingInitial(false);
    };
    getRecentAliments()
      .then((r) => setRecents(r as NutritionAliment[]))
      .catch(() => {})
      .finally(finish);
    fetch("/api/aliments?q=")
      .then((r) => r.json())
      .then((d) => setPopulaires(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(finish);
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

  async function handleConfirm(quantite: number) {
    if (!selected || pending) return;
    setPending(true);

    let alimentId = selected.id;
    if (!alimentId && selected.source === "openfoodfacts") {
      const { id } = await upsertExternalAliment(selected);
      alimentId = id;
    }

    // Update optimiste via le store — ferme le modal instantanément
    addEntry(mealNumber, selected, alimentId, quantite, date, mealTime);
    onClose();
  }

  async function handleCustomCreated(id: string) {
    // Créer l'entrée nutrition côté serveur puis rafraîchir le store
    onClose();
    await addNutritionEntry(mealNumber, id, 100, date, mealTime);
    useNutritionStore.getState().fetchDay(date);
  }

  function handleEdited(updated: NutritionAliment) {
    setSelected(updated);
    setStep("quantity");
  }

  const isCustom = selected?.is_global === false && !!selected?.id;
  const mealLabel = `Repas ${mealNumber}`;

  const today = new Date().toISOString().split("T")[0];
  const dateLabel =
    date === today
      ? "Aujourd'hui"
      : new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });

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
          {step !== "quantity" && (
            <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
              <div className="w-7" />
              <div className="text-center">
                <p
                  className="font-semibold text-sm leading-none"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step === "custom"
                    ? "Aliment personnalisé"
                    : step === "edit"
                      ? isCustom
                        ? "Modifier l'aliment"
                        : "Corriger l'aliment"
                      : "Ajouter"}
                </p>
                {step === "search" && (
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--accent-text)" }}
                  >
                    {mealLabel} · {dateLabel}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="p-1">
                <X size={20} style={{ color: "var(--text-muted)" }} />
              </button>
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
              loading={loading}
              loadingInitial={loadingInitial}
              onSelect={handleSelect}
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
