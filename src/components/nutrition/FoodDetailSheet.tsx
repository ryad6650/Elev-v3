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
  const F = "var(--font-nunito), sans-serif";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg-gradient)" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        <TopBar
          onBack={onBack}
          onEdit={onEdit}
          fav={fav}
          onToggleFav={
            onToggleFavorite
              ? () => {
                  setFav((f) => !f);
                  onToggleFavorite();
                }
              : undefined
          }
        />

        <div
          className="flex-1 overflow-y-auto px-5 pb-2 min-h-0"
          style={
            {
              overscrollBehavior: "contain",
              scrollbarWidth: "none",
            } as React.CSSProperties
          }
        >
          {/* Name + brand centered */}
          <div className="mb-[18px]">
            <p
              className="text-[22px] font-semibold text-center leading-tight"
              style={{ fontFamily: F, color: "var(--text-primary)" }}
            >
              {aliment.nom}
            </p>
            {aliment.marque && (
              <p
                className="text-[15px] font-medium text-center mt-[5px]"
                style={{ fontFamily: F, color: "var(--text-muted)" }}
              >
                {aliment.marque}
              </p>
            )}
          </div>

          {/* Macros card: kcal | G | P | L */}
          <MacrosCard cal={cal} gluc={gluc} prot={prot} lip={lip} />

          {/* Portion button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-between mb-5 active:opacity-80"
              style={{
                padding: "18px 20px",
                borderRadius: "var(--radius-sm)",
                background: "var(--glass-bg)",
                backdropFilter: "var(--glass-blur)",
                border: hasPortion
                  ? "1px solid var(--glass-border)"
                  : "1.5px dashed rgba(0,0,0,0.10)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center gap-[10px]">
                <div
                  className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
                  style={{ background: "rgba(42,157,110,0.10)" }}
                >
                  {hasPortion ? (
                    <Pencil size={16} style={{ color: "var(--green)" }} />
                  ) : (
                    <Plus size={18} style={{ color: "var(--green)" }} />
                  )}
                </div>
                <span
                  className="text-[15px] font-semibold"
                  style={{ fontFamily: F, color: "var(--text-secondary)" }}
                >
                  {hasPortion ? "Modifier la portion" : "Ajouter une portion"}
                </span>
              </div>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                ›
              </span>
            </button>
          )}

          <FoodNutritionCard
            aliment={aliment}
            qty={qty}
            cal={cal}
            prot={prot}
            gluc={gluc}
            lip={lip}
          />
        </div>

        {/* Bottom bar */}
        <BottomBar
          mode={mode}
          setMode={setMode}
          pickerVal={pickerVal}
          setPickerVal={setPickerVal}
          editing={editing}
          setEditing={setEditing}
          inputRef={inputRef}
          step={step}
          min={min}
          max={max}
          hasPortion={hasPortion}
          portionLabel={aliment.portion_nom ?? "portion"}
          portionG={portionG}
          qty={qty}
          pending={pending}
          confirmLabel={confirmLabel}
          mealLabel={mealLabel}
          onConfirm={() =>
            onConfirm(qty, mode === "portion" ? pickerVal : null)
          }
        />
      </div>
    </div>
  );
}

function TopBar({
  onBack,
  onEdit,
  fav,
  onToggleFav,
}: {
  onBack: () => void;
  onEdit?: () => void;
  fav: boolean;
  onToggleFav?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 pb-2 shrink-0"
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
    >
      <RoundBtn onClick={onBack}>
        <ChevronLeft size={14} style={{ color: "var(--text-secondary)" }} />
      </RoundBtn>
      <span
        className="text-[12px] font-semibold uppercase tracking-[0.1em]"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          color: "var(--text-muted)",
        }}
      >
        Fiche produit
      </span>
      <div className="flex gap-2">
        {onEdit && (
          <RoundBtn onClick={onEdit}>
            <Pencil size={14} style={{ color: "var(--text-secondary)" }} />
          </RoundBtn>
        )}
        {onToggleFav && (
          <RoundBtn onClick={onToggleFav}>
            <Heart
              size={14}
              fill={fav ? "#e06060" : "none"}
              style={{ color: fav ? "#e06060" : "var(--text-secondary)" }}
            />
          </RoundBtn>
        )}
      </div>
    </div>
  );
}

function MacrosCard({
  cal,
  gluc,
  prot,
  lip,
}: {
  cal: number;
  gluc: number;
  prot: number;
  lip: number;
}) {
  const F = "var(--font-nunito), sans-serif";
  const items = [
    { val: cal, label: "kcal", color: "var(--text-primary)" },
    { val: gluc, label: "Glucides", color: "var(--color-carbs)" },
    { val: prot, label: "Protéines", color: "var(--color-protein)" },
    { val: lip, label: "Lipides", color: "var(--color-fat)" },
  ];
  return (
    <div
      className="flex items-center rounded-[20px] mb-5 p-[26px_16px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {items.map((m, i) => (
        <div key={m.label} className="contents">
          {i > 0 && (
            <div
              className="w-px h-[42px] shrink-0"
              style={{ background: "rgba(0,0,0,0.06)" }}
            />
          )}
          <div className="flex-1 flex flex-col items-center gap-[5px]">
            <span
              className="text-[24px] font-bold leading-none"
              style={{ fontFamily: F, color: m.color }}
            >
              {m.val}
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.04em]"
              style={{ fontFamily: F, color: "var(--text-muted)" }}
            >
              {m.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoundBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {children}
    </button>
  );
}

function BottomBar({
  mode,
  setMode,
  pickerVal,
  setPickerVal,
  editing,
  setEditing,
  inputRef,
  step,
  min,
  max,
  hasPortion,
  portionLabel,
  portionG,
  qty,
  pending,
  confirmLabel,
  mealLabel,
  onConfirm,
}: {
  mode: "g" | "portion";
  setMode: (m: "g" | "portion") => void;
  pickerVal: number;
  setPickerVal: (fn: (v: number) => number) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  step: number;
  min: number;
  max: number;
  hasPortion: boolean;
  portionLabel: string;
  portionG: number;
  qty: number;
  pending?: boolean;
  confirmLabel?: string;
  mealLabel: string;
  onConfirm: () => void;
}) {
  const F = "var(--font-nunito), sans-serif";
  return (
    <div
      className="shrink-0 flex flex-col gap-3 px-6 pt-[14px]"
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* Tabs */}
      <div
        className="flex rounded-[10px] p-[3px] gap-[2px]"
        style={{ background: "rgba(0,0,0,0.04)" }}
      >
        <button
          onClick={() => {
            setMode("g");
            setPickerVal(() => 100);
          }}
          className="flex-1 py-[7px] rounded-lg text-[12px] font-semibold text-center"
          style={{
            fontFamily: F,
            background: mode === "g" ? "#fff" : "transparent",
            color: mode === "g" ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow: mode === "g" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}
        >
          Grammes
        </button>
        <button
          onClick={() => {
            if (hasPortion) {
              setMode("portion");
              setPickerVal(() => 1);
            }
          }}
          className="flex-1 py-[7px] rounded-lg text-[12px] font-semibold text-center"
          style={{
            fontFamily: F,
            background: mode === "portion" ? "#fff" : "transparent",
            color:
              mode === "portion" ? "var(--text-primary)" : "var(--text-muted)",
            opacity: hasPortion ? 1 : 0.4,
            boxShadow:
              mode === "portion" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}
        >
          {hasPortion ? `${portionLabel} (${portionG}g)` : "Portion"}
        </button>
      </div>
      {/* Qty row */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setPickerVal((v) => Math.max(min, v - step))}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.04)" }}
        >
          <Minus size={18} style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex items-baseline justify-center gap-1 min-w-[120px]">
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              defaultValue={pickerVal}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v >= min && v <= max)
                  setPickerVal(() =>
                    mode === "portion" ? Math.round(v * 2) / 2 : Math.round(v),
                  );
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-[60px] text-center text-[28px] font-bold outline-none bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              style={{ fontFamily: F, color: "var(--text-primary)" }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setEditing(true);
                setTimeout(() => inputRef.current?.select(), 10);
              }}
              className="text-[28px] font-bold text-center w-[60px] bg-transparent border-none"
              style={{ fontFamily: F, color: "var(--text-primary)" }}
            >
              {pickerVal}
            </button>
          )}
          <span
            className="text-[14px] font-semibold"
            style={{ fontFamily: F, color: "var(--text-muted)" }}
          >
            {mode === "portion" ? portionLabel : "g"}
          </span>
        </div>
        <button
          onClick={() => setPickerVal((v) => Math.min(max, v + step))}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(42,157,110,0.10)" }}
        >
          <Plus size={18} style={{ color: "var(--green)" }} />
        </button>
      </div>
      {/* Add button */}
      <button
        onClick={onConfirm}
        disabled={pending}
        className="w-full py-[14px] rounded-[12px] text-[14px] font-semibold text-white active:scale-[0.98] transition-transform"
        style={{
          fontFamily: F,
          background: "var(--green)",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Ajout..." : (confirmLabel ?? `Ajouter au ${mealLabel}`)}
      </button>
    </div>
  );
}
