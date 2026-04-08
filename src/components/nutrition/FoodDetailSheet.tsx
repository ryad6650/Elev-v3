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
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  useEffect(() => {
    setFullscreenModal(true);
    return () => setFullscreenModal(false);
  }, [setFullscreenModal]);

  const step = mode === "portion" ? 0.5 : 10;
  const max = mode === "portion" ? 20 : 2000;
  const min = mode === "portion" ? 0.5 : 1;

  const qty = mode === "portion" ? pickerVal * portionG : pickerVal;
  const scale = qty / 100;
  const cal = Math.round(aliment.calories * scale);
  const prot = Math.round((aliment.proteines ?? 0) * scale * 10) / 10;
  const gluc = Math.round((aliment.glucides ?? 0) * scale * 10) / 10;
  const lip = Math.round((aliment.lipides ?? 0) * scale * 10) / 10;

  const displayQty =
    mode === "portion"
      ? `${pickerVal} ${aliment.portion_nom ?? "portion"}`
      : `${pickerVal}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg-gradient)" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 pb-2 shrink-0"
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <RoundBtn onClick={onBack}>
            <ChevronLeft size={14} style={{ color: "#78716C" }} />
          </RoundBtn>
          <span
            className="text-[9px] font-bold tracking-[0.1em] uppercase"
            style={{ color: "#78716C" }}
          >
            Fiche produit
          </span>
          <div className="flex gap-1.5">
            {onEdit && (
              <RoundBtn onClick={onEdit}>
                <Pencil size={13} style={{ color: "#78716C" }} />
              </RoundBtn>
            )}
            {onToggleFavorite && (
              <RoundBtn
                onClick={() => {
                  setFav((f) => !f);
                  onToggleFavorite();
                }}
              >
                {fav ? (
                  <Heart
                    size={13}
                    fill="#e06060"
                    style={{ color: "#e06060" }}
                  />
                ) : (
                  <Heart size={13} style={{ color: "#78716C" }} />
                )}
              </RoundBtn>
            )}
          </div>
        </div>

        {/* Food identity */}
        <div className="flex items-center gap-3.5 px-5 pt-1 pb-4 shrink-0">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
          >
            <span
              className="text-[22px] text-white font-bold"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              {aliment.nom.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[20px] leading-tight"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                color: "#4A3728",
              }}
            >
              {aliment.nom}
            </p>
            {aliment.marque && (
              <p className="text-[11px] mt-0.5" style={{ color: "#78716C" }}>
                {aliment.marque}
              </p>
            )}
            {aliment.source === "openfoodfacts" && (
              <span
                className="inline-block mt-1 text-[7px] font-bold tracking-wide uppercase px-[7px] py-[2px] rounded-md"
                style={{
                  background: "rgba(116,191,122,0.1)",
                  color: "#74bf7a",
                }}
              >
                Open Food Facts
              </span>
            )}
          </div>
        </div>

        {/* Scrollable nutrition content */}
        <div
          className="flex-1 overflow-y-auto px-5 pb-2 min-h-0"
          style={
            {
              overscrollBehavior: "contain",
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
          />
        </div>

        {/* Quantity bar */}
        <div className="shrink-0 px-5 pt-2.5 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5">
            <RoundBtn
              onClick={() => setPickerVal((v) => Math.max(min, v - step))}
              size={30}
            >
              <Minus size={16} style={{ color: "#78716C" }} />
            </RoundBtn>
            {editing ? (
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                defaultValue={pickerVal}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= min && v <= max) {
                    setPickerVal(
                      mode === "portion"
                        ? Math.round(v * 2) / 2
                        : Math.round(v),
                    );
                  }
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-[54px] py-1.5 px-1 rounded-[10px] text-[14px] font-bold text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                style={{
                  border: "1px solid rgba(74,55,40,0.12)",
                  background: "rgba(255,255,255,0.6)",
                  color: "#4A3728",
                  fontFamily: "var(--font-sans)",
                }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setEditing(true);
                  setTimeout(() => inputRef.current?.select(), 10);
                }}
                className="w-[54px] py-1.5 px-1 rounded-[10px] text-[14px] font-bold text-center"
                style={{
                  border: "1px solid rgba(74,55,40,0.12)",
                  background: "rgba(255,255,255,0.6)",
                  color: "#4A3728",
                }}
              >
                {displayQty}
              </button>
            )}
            <RoundBtn
              onClick={() => setPickerVal((v) => Math.min(max, v + step))}
              size={30}
            >
              <Plus size={16} style={{ color: "#78716C" }} />
            </RoundBtn>
          </div>
          <UnitPill
            active={mode === "g"}
            onClick={() => {
              setMode("g");
              setPickerVal(100);
            }}
          >
            g
          </UnitPill>
          <UnitPill
            active={mode === "portion"}
            disabled={!hasPortion}
            onClick={() => hasPortion && (setMode("portion"), setPickerVal(1))}
          >
            portion
          </UnitPill>
          <span
            className="flex-1 text-right"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: 16,
              color: "#4A3728",
            }}
          >
            {cal}{" "}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 9,
                color: "#78716C",
              }}
            >
              kcal
            </span>
          </span>
        </div>

        {/* Add button */}
        <div className="shrink-0 px-5 pt-2 pb-2">
          <button
            onClick={() =>
              onConfirm(qty, mode === "portion" ? pickerVal : null)
            }
            disabled={pending}
            className="w-full py-3 rounded-[14px] text-[13px] font-bold text-white active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #c4a882, #a0785c)",
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Ajout..." : (confirmLabel ?? `Ajouter au ${mealLabel}`)}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoundBtn({
  onClick,
  children,
  size = 28,
}: {
  onClick: () => void;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full"
      style={{ width: size, height: size, background: "rgba(74,55,40,0.07)" }}
    >
      {children}
    </button>
  );
}

function UnitPill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-[9px] font-bold py-[5px] px-2.5 rounded-lg"
      style={{
        background: active
          ? "linear-gradient(135deg, #c4a882, #a0785c)"
          : "rgba(74,55,40,0.08)",
        color: active ? "#fff" : "#78716C",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
