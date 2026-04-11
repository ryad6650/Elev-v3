"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, SquarePen, Camera } from "lucide-react";
import { sumEntries } from "@/lib/nutrition-utils";
import type {
  Meal,
  NutritionEntry,
  NutritionProfile,
} from "@/lib/nutrition-utils";
import SwipeableFoodItem from "./SwipeableFoodItem";
import { useUiStore } from "@/store/uiStore";
import MealNutriSection from "./MealNutriSection";

const MEAL_META: Record<number, { emoji: string; name: string; pct: number }> =
  {
    1: { emoji: "☕", name: "Petit déjeuner", pct: 0.3 },
    2: { emoji: "🥘", name: "Déjeuner", pct: 0.29 },
    3: { emoji: "🍎", name: "En-cas", pct: 0.12 },
    4: { emoji: "🥗", name: "Dîner", pct: 0.29 },
  };

interface Props {
  meal: Meal;
  profile: NutritionProfile;
  onClose: () => void;
  onFoodClick: (entry: NutritionEntry) => void;
  onAdd: () => void;
}

export default function MealDetailView({
  meal,
  profile,
  onClose,
  onFoodClick,
  onAdd,
}: Props) {
  const meta = MEAL_META[meal.meal_number] ?? {
    emoji: "🍽️",
    name: `Repas ${meal.meal_number}`,
    pct: 0.25,
  };
  const total = sumEntries(meal.entries);
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
      setFullscreenModal(false);
    };
  }, [setFullscreenModal]);

  function handleClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 320);
  }

  const objCal = profile.objectif_calories ?? 2000;
  const objProt = profile.objectif_proteines ?? 44;
  const objGluc = profile.objectif_glucides ?? 91;
  const objLip = profile.objectif_lipides ?? 18;
  const mealPct = objCal > 0 ? meta.pct : 0;
  const mealTarget = Math.round(objCal * mealPct);

  const macroRows = [
    [
      { val: `${Math.round(total.calories)} kcal`, label: "Calories" },
      { val: `${total.glucides} g`, label: "Glucides" },
    ],
    [
      { val: `${total.proteines} g`, label: "Protéines" },
      { val: `${total.lipides} g`, label: "Lipides" },
    ],
  ];

  const progressBars = [
    {
      label: "Calories",
      val: `${Math.round(total.calories)} / ${mealTarget} kcal`,
      pct: mealTarget > 0 ? total.calories / mealTarget : 0,
    },
    {
      label: "Glucides",
      val: `${total.glucides} / ${Math.round(objGluc * mealPct)} g`,
      pct: objGluc > 0 ? total.glucides / (objGluc * mealPct) : 0,
    },
    {
      label: "Protéines",
      val: `${total.proteines} / ${Math.round(objProt * mealPct)} g`,
      pct: objProt > 0 ? total.proteines / (objProt * mealPct) : 0,
    },
    {
      label: "Lipides",
      val: `${total.lipides} / ${Math.round(objLip * mealPct)} g`,
      pct: objLip > 0 ? total.lipides / (objLip * mealPct) : 0,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        background: "#0C0E0E",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 shrink-0"
          style={{
            paddingTop: "max(1.25rem, env(safe-area-inset-top))",
            paddingBottom: 12,
          }}
        >
          <button
            onClick={handleClose}
            className="p-1 active:opacity-70 transition-opacity"
          >
            <ChevronLeft size={26} style={{ color: "var(--text-primary)" }} />
          </button>
          <span
            className="text-[17px] font-semibold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {meta.name}
          </span>
          <button className="p-1 active:opacity-70 transition-opacity">
            <SquarePen size={22} style={{ color: "var(--text-primary)" }} />
          </button>
        </div>

        {/* Scrollable */}
        <div
          className="flex-1 overflow-y-auto min-h-0 pb-4"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {/* Hero */}
          <div
            className="mx-4 mb-5 relative overflow-hidden"
            style={{ height: 180, borderRadius: 20, background: "#1A472A" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 72 }}>{meta.emoji}</span>
            </div>
            <button className="absolute bottom-3 right-3 p-2 rounded-full active:opacity-70 transition-opacity">
              <Camera size={22} style={{ color: "rgba(255,255,255,0.65)" }} />
            </button>
          </div>

          {/* Macro 2×2 grid */}
          <div
            className="mx-4 mb-6 rounded-2xl overflow-hidden"
            style={{ background: "#262828", border: "1.5px solid #8A9090" }}
          >
            {macroRows.map((row, ri) => (
              <div
                key={ri}
                className="flex"
                style={{ borderTop: ri > 0 ? "1px solid #595F60" : undefined }}
              >
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className="flex-1 py-4 flex flex-col items-center gap-1"
                    style={{
                      borderLeft: ci > 0 ? "1px solid #595F60" : undefined,
                    }}
                  >
                    <span
                      className="text-[20px] font-bold"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {cell.val}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {cell.label}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Liste aliments */}
          <div className="mx-4 mb-6">
            {meal.entries.length === 0 ? (
              <p
                className="text-center py-4 text-[14px]"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Aucun aliment dans ce repas
              </p>
            ) : (
              meal.entries.map((entry) => (
                <div key={entry.id}>
                  <SwipeableFoodItem entry={entry} onFoodClick={onFoodClick} />
                  <div style={{ height: 1, background: "#595F60" }} />
                </div>
              ))
            )}
          </div>

          <MealNutriSection values={total} progressBars={progressBars} />
        </div>

        {/* Ajouter plus */}
        <div
          className="shrink-0 px-4"
          style={{
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            paddingTop: 10,
            background: "#0C0E0E",
          }}
        >
          <button
            onClick={onAdd}
            className="w-full py-4 rounded-full text-[16px] font-bold active:scale-[0.98] transition-transform"
            style={{
              background: "white",
              color: "#1C1917",
              fontFamily: "var(--font-sans)",
            }}
          >
            Ajouter plus
          </button>
        </div>
      </div>
    </div>
  );
}
