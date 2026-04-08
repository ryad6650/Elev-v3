"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Heart, Pencil, Plus, Minus } from "lucide-react";
import type { NutritionAliment } from "@/lib/nutrition-utils";
import FoodNutritionCard from "./FoodNutritionCard";
import { useUiStore } from "@/store/uiStore";

interface Props {
  aliment: NutritionAliment;
  mealLabel: string;
  onBack: () => void;
  onConfirm: (quantite: number, quantitePortion: number | null) => void;
  onEdit?: () => void;
  pending?: boolean;
  initialQuantity?: number;
  initialPortionQty?: number | null;
  confirmLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function FoodDetailSheet({
  aliment,
  mealLabel,
  onBack,
  onConfirm,
  onEdit,
  pending,
  initialQuantity,
  initialPortionQty,
  confirmLabel,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const portionG = aliment.taille_portion_g ?? 0;
  const hasPortion = portionG > 0;

  const initMode =
    initialPortionQty != null && hasPortion
      ? ("portion" as const)
      : initialQuantity && !initialPortionQty
        ? ("g" as const)
        : hasPortion
          ? ("portion" as const)
          : ("g" as const);
  const initVal = initialQuantity
    ? initMode === "portion" && initialPortionQty != null
      ? initialPortionQty
      : initMode === "portion" && portionG > 0
        ? Math.round((initialQuantity / portionG) * 2) / 2 || 1
        : initialQuantity
    : hasPortion
      ? 1
      : 100;

  const [mode, setMode] = useState<"g" | "portion">(initMode);
  const [pickerVal, setPickerVal] = useState(initVal);
  const [fav, setFav] = useState(isFavorite ?? false);
  const [showDetails, setShowDetails] = useState(true);

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  useEffect(() => {
    setFullscreenModal(true);
    return () => setFullscreenModal(false);
  }, [setFullscreenModal]);

  const pickerStep = mode === "portion" ? 0.5 : 1;
  const pickerMax = mode === "portion" ? 20 : 2000;
  const pickerMin = mode === "portion" ? 0.5 : 1;

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const qty = mode === "portion" ? pickerVal * portionG : pickerVal;
  const scale = qty / 100;
  const cal = Math.round(aliment.calories * scale);
  const prot = Math.round((aliment.proteines ?? 0) * scale * 10) / 10;
  const gluc = Math.round((aliment.glucides ?? 0) * scale * 10) / 10;
  const lip = Math.round((aliment.lipides ?? 0) * scale * 10) / 10;

  function switchMode(m: "g" | "portion") {
    setMode(m);
    setPickerVal(m === "portion" ? 1 : 100);
  }

  function inc() {
    setPickerVal((v) => Math.min(pickerMax, v + pickerStep));
  }
  function dec() {
    setPickerVal((v) => Math.max(pickerMin, v - pickerStep));
  }

  const displayQty =
    mode === "portion"
      ? `${pickerVal} ${aliment.portion_nom ?? "portion"}`
      : `${pickerVal}g`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#F2E8D5" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
          <button
            onClick={onBack}
            className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "#78716C" }} />
          </button>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Pencil size={14} style={{ color: "#78716C" }} />
              </button>
            )}
            {onToggleFavorite && (
              <button
                onClick={() => {
                  setFav((f) => !f);
                  onToggleFavorite();
                }}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {fav ? (
                  <Heart
                    size={14}
                    fill="#C07858"
                    style={{ color: "#C07858" }}
                  />
                ) : (
                  <span className="text-sm" style={{ color: "#78716C" }}>
                    &#9825;
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-3 px-5 pt-3 shrink-0">
          <div
            className="w-[3px] h-8 rounded-sm shrink-0"
            style={{ background: "#4A3728" }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-[22px] leading-tight tracking-tight"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                color: "#2C1E14",
              }}
            >
              {aliment.nom}
            </p>
            {aliment.marque && (
              <p className="text-[11px] mt-0.5" style={{ color: "#78716C" }}>
                {aliment.marque}
              </p>
            )}
          </div>
        </div>
        {aliment.source === "openfoodfacts" && (
          <div className="px-5 mt-1.5 shrink-0">
            <span
              className="inline-flex items-center gap-1 text-[8px] font-bold rounded-md px-[7px] py-[3px] tracking-wide"
              style={{
                background: "rgba(0,0,0,0.05)",
                color: "#78716C",
              }}
            >
              <span className="text-[10px]">&#127807;</span> OpenFoodFacts
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-3 pb-2 min-h-0"
          style={
            {
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            } as React.CSSProperties
          }
        >
          <FoodNutritionCard
            aliment={aliment}
            qty={qty}
            cal={cal}
            prot={prot}
            gluc={gluc}
            lip={lip}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails((d) => !d)}
          />
        </div>

        {/* Bottom quantity bar */}
        <div
          className="shrink-0 px-4 pt-2.5 pb-4"
          style={{
            background: "rgba(255,255,255,0.5)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {/* Preview macros */}
          <p
            className="text-[10px] font-semibold text-center mb-2"
            style={{ color: "#78716C" }}
          >
            &#8776;{" "}
            <span className="font-bold" style={{ color: "var(--accent-text)" }}>
              {cal} kcal
            </span>{" "}
            · G {gluc}g · P {prot}g · L {lip}g
          </p>

          {/* Picker row */}
          <div className="flex gap-2 items-center">
            <div
              className="flex-1 flex items-center rounded-xl overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <button
                onClick={dec}
                className="w-9 h-9 flex items-center justify-center shrink-0"
              >
                <Minus size={16} style={{ color: "#78716C" }} />
              </button>
              {editing ? (
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  defaultValue={pickerVal}
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= pickerMin && v <= pickerMax) {
                      setPickerVal(
                        mode === "portion"
                          ? Math.round(v * 2) / 2
                          : Math.round(v),
                      );
                    }
                    setEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  className="flex-1 text-center text-[15px] font-bold bg-transparent outline-none w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: "#2C1E14" }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setEditing(true);
                    setTimeout(() => inputRef.current?.select(), 10);
                  }}
                  className="flex-1 text-center text-[15px] font-bold bg-transparent"
                  style={{ color: "#2C1E14" }}
                >
                  {displayQty}
                </button>
              )}
              <button
                onClick={inc}
                className="w-9 h-9 flex items-center justify-center shrink-0"
              >
                <Plus size={16} style={{ color: "#78716C" }} />
              </button>
            </div>

            {/* Unit toggle */}
            <div
              className="flex rounded-xl overflow-hidden shrink-0"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <button
                onClick={() => switchMode("g")}
                className="px-3 py-2 text-[10px] font-bold tracking-wide"
                style={{
                  background: mode === "g" ? "var(--accent)" : "transparent",
                  color: mode === "g" ? "#fff" : "#78716C",
                }}
              >
                g
              </button>
              <button
                onClick={() => hasPortion && switchMode("portion")}
                className="px-3 py-2 text-[10px] font-bold tracking-wide"
                style={{
                  background:
                    mode === "portion" ? "var(--accent)" : "transparent",
                  color: mode === "portion" ? "#fff" : "#78716C",
                  opacity: hasPortion ? 1 : 0.4,
                  cursor: hasPortion ? "pointer" : "default",
                }}
              >
                Portion
              </button>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={() =>
              onConfirm(qty, mode === "portion" ? pickerVal : null)
            }
            disabled={pending}
            className="w-full h-[42px] rounded-[14px] flex items-center justify-center gap-1.5 text-[13px] font-bold text-white mt-2 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #1B2E1D, #2d4a2f)",
              border: "1px solid rgba(116,191,122,0.3)",
              boxShadow: "0 4px 16px rgba(27,46,29,0.5)",
              opacity: pending ? 0.6 : 1,
            }}
          >
            <Plus size={14} />
            {pending ? "Ajout..." : (confirmLabel ?? `Ajouter au ${mealLabel}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
