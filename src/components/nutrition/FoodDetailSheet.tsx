"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronDown, Star, Pencil } from "lucide-react";
import type { NutritionAliment } from "@/lib/nutrition-utils";
import QuantityScrollPicker from "@/components/nutrition/QuantityScrollPicker";

const PICK_ITEM_H = 40;
const PICK_VISIBLE = 7;
const PICK_HALF = Math.floor(PICK_VISIBLE / 2);

function UnitScrollColumn({
  units,
  value,
  onChange,
}: {
  units: string[];
  value: number;
  onChange: (idx: number) => void;
}) {
  const touchRef = useRef<{ startY: number; startVal: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleTouchMove(e: TouchEvent) {
      if (!touchRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const dy = e.touches[0].clientY - touchRef.current.startY;
      const mod = ((dy % PICK_ITEM_H) + PICK_ITEM_H) % PICK_ITEM_H;
      setDragOffset(mod > PICK_ITEM_H / 2 ? mod - PICK_ITEM_H : mod);
      const steps = -Math.round(dy / PICK_ITEM_H);
      const newVal = Math.max(
        0,
        Math.min(units.length - 1, touchRef.current.startVal + steps),
      );
      if (newVal !== valueRef.current) onChange(newVal);
    }
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [units.length, onChange]);

  return (
    <div
      ref={containerRef}
      style={{
        height: PICK_ITEM_H * PICK_VISIBLE,
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        perspective: `${PICK_ITEM_H * PICK_VISIBLE * 1.2}px`,
      }}
      onTouchStart={(e) => {
        touchRef.current = { startY: e.touches[0].clientY, startVal: value };
        setDragOffset(0);
        setDragging(true);
      }}
      onTouchEnd={() => {
        touchRef.current = null;
        setDragOffset(0);
        setDragging(false);
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 28,
          background: "linear-gradient(to bottom, #262220 10%, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
          background: "linear-gradient(to top, #262220 10%, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${dragOffset}px)`,
          transition: dragging ? "none" : "transform 0.12s ease-out",
          zIndex: 1,
        }}
      >
        {Array.from({ length: PICK_VISIBLE }, (_, i) => i - PICK_HALF).map(
          (offset) => {
            const idx = value + offset;
            const valid = idx >= 0 && idx < units.length;
            const dist = Math.abs(offset);
            return (
              <div
                key={offset}
                style={{
                  height: PICK_ITEM_H,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  paddingLeft: 8,
                  paddingRight: 12,
                  transform: `rotateX(${offset * 12}deg)`,
                }}
              >
                {valid && (
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: offset === 0 ? 700 : 400,
                      color: offset === 0 ? "#C2C2C3" : "var(--text-secondary)",
                      opacity: offset === 0 ? 1 : dist === 1 ? 0.5 : 0.25,
                      lineHeight: 1,
                      textAlign: "center",
                      fontFamily: "var(--font-sans)",
                      transition: dragging
                        ? "none"
                        : "font-size 0.1s, opacity 0.1s",
                    }}
                  >
                    {units[idx]}
                  </span>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

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

function fmt(v: number) {
  if (v === 0) return "0";
  if (v < 1) return v.toFixed(2);
  if (v < 10) return v.toFixed(1);
  return String(Math.round(v));
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
  const initMode: "g" | "portion" =
    initialPortionQty != null && hasPortion
      ? "portion"
      : hasPortion && initialQuantity == null
        ? "portion"
        : "g";
  const initVal =
    initialQuantity != null
      ? initMode === "portion" && initialPortionQty != null
        ? initialPortionQty
        : initMode === "portion"
          ? Math.round((initialQuantity / portionG) * 2) / 2 || 1
          : initialQuantity
      : hasPortion
        ? 1
        : 100;

  const [mode, setMode] = useState<"g" | "portion">(initMode);
  const [val, setVal] = useState(initVal);
  const [fav, setFav] = useState(isFavorite ?? false);
  const [showPicker, setShowPicker] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDragRef = useRef<{ startY: number } | null>(null);
  const prevGValRef = useRef(initMode === "g" ? initVal : 100);
  const prevPortionValRef = useRef(initMode === "portion" ? initVal : 1);

  function onHandleTouchStart(e: React.TouchEvent) {
    handleDragRef.current = { startY: e.touches[0].clientY };
  }

  function onHandleTouchEnd(e: React.TouchEvent) {
    if (!handleDragRef.current) return;
    const dy = e.changedTouches[0].clientY - handleDragRef.current.startY;
    handleDragRef.current = null;
    if (dy < -15) setShowPicker(true);
    else if (dy > 15) setShowPicker(false);
    else setShowPicker((p) => !p);
  }

  const qtyG = mode === "portion" ? val * portionG : val;
  const scale = qtyG / 100;
  const cal = Math.round(aliment.calories * scale);
  const prot = Math.round((aliment.proteines ?? 0) * scale * 10) / 10;
  const gluc = Math.round((aliment.glucides ?? 0) * scale * 10) / 10;
  const lip = Math.round((aliment.lipides ?? 0) * scale * 10) / 10;
  const unitLabel =
    mode === "portion" ? (aliment.portion_nom ?? "portion") : "g";

  const macros = [
    { val: cal, unit: "kcal", label: "Calories" },
    { val: gluc, unit: "g", label: "Glucides" },
    { val: prot, unit: "g", label: "Protéines" },
    { val: lip, unit: "g", label: "Lipides" },
  ];

  const nutriRows: { label: string; val: string; sub?: boolean }[] = [
    { label: "Calories", val: `${cal} kcal` },
    { label: "Protéines", val: `${prot} g` },
    { label: "Glucides", val: `${gluc} g` },
    {
      label: "Fibres alimentaires",
      val:
        aliment.fibres != null
          ? `${fmt((aliment.fibres * qtyG) / 100)} g`
          : "—",
      sub: true,
    },
    {
      label: "Sucre",
      val:
        aliment.sucres != null
          ? `${fmt((aliment.sucres * qtyG) / 100)} g`
          : "—",
      sub: true,
    },
    { label: "Lipides", val: `${lip} g` },
    ...(aliment.sel != null
      ? [
          {
            label: "Sel",
            val: `${fmt((aliment.sel * qtyG) / 100)} g`,
            sub: true,
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#1B1715" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-3 shrink-0"
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <button
            onClick={onBack}
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
            {mealLabel}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 active:opacity-70 transition-opacity"
              >
                <Pencil size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            )}
            {onToggleFavorite ? (
              <button
                onClick={() => {
                  setFav((f) => !f);
                  onToggleFavorite();
                }}
                className="p-1 active:opacity-70 transition-opacity"
              >
                <Star
                  size={22}
                  fill={fav ? "#FACC15" : "none"}
                  style={{ color: fav ? "#FACC15" : "#FACC15" }}
                />
              </button>
            ) : (
              <div className="w-9" />
            )}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto min-h-0 pb-2"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
          onClick={() => {
            if (showPicker) setShowPicker(false);
          }}
        >
          {/* Hero */}
          <div className="flex flex-col items-center px-5 pt-4 pb-5 text-center">
            <p
              className="text-[22px] font-extrabold leading-tight"
              style={{ color: "#fff", fontFamily: "var(--font-sans)" }}
            >
              {aliment.nom}
            </p>
            {aliment.marque && (
              <p
                className="text-[16px] mt-1"
                style={{ color: "#666", fontFamily: "var(--font-sans)" }}
              >
                {aliment.marque}
              </p>
            )}
            <div className="flex items-baseline justify-center gap-1.5 mt-3">
              <span
                className="text-[30px] font-extrabold leading-none"
                style={{ color: "#fff" }}
              >
                {cal}
              </span>
              <span
                className="text-[16px] font-semibold"
                style={{ color: "#888" }}
              >
                kcal
              </span>
            </div>
            <p
              className="text-[14px] font-semibold mt-1.5"
              style={{ color: "#74BF7A" }}
            >
              Pour{" "}
              {mode === "portion"
                ? `${val} ${unitLabel}`
                : `${Math.round(qtyG)}g`}
            </p>
          </div>

          {/* Ring + Macros card */}
          <div
            className="mx-4 rounded-[20px] p-5 flex items-center gap-5"
            style={{ background: "#262220" }}
          >
            <div
              className="relative shrink-0"
              style={{ width: 88, height: 88 }}
            >
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="37"
                  fill="none"
                  stroke="#1B1715"
                  strokeWidth="7"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="37"
                  fill="none"
                  stroke="#74BF7A"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(1, cal / (aliment.calories || 1)) * 232.5} ${232.5}`}
                  transform="rotate(-90 44 44)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[22px] font-extrabold"
                  style={{ color: "#fff" }}
                >
                  {cal}
                </span>
                <span
                  className="text-[11px] uppercase tracking-wide"
                  style={{ color: "#888" }}
                >
                  kcal
                </span>
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              {[
                { val: gluc, label: "Glucides" },
                { val: prot, label: "Protéines" },
                { val: lip, label: "Lipides" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex-1 rounded-[14px] py-3 px-1.5 flex flex-col items-center gap-1"
                  style={{ background: "#1B1715" }}
                >
                  <span
                    className="text-[18px] font-bold leading-none"
                    style={{ color: "#74BF7A" }}
                  >
                    {m.val}g
                  </span>
                  <span className="text-[13px]" style={{ color: "#888" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-3" />

          {/* Valeurs nutritives card */}
          <div
            className="mx-4 rounded-[20px] p-5 mb-6"
            style={{ background: "#262220" }}
          >
            <p
              className="text-[13px] font-bold uppercase tracking-wider pb-3 mb-1"
              style={{
                color: "#555",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Valeurs nutritives ({Math.round(qtyG)}g)
            </p>
            {nutriRows.map((r, i) => (
              <div
                key={r.label + i}
                className="flex items-center justify-between"
                style={{
                  padding: r.sub ? "4px 0" : "11px 0",
                  borderBottom:
                    i < nutriRows.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                }}
              >
                <span
                  className="text-[16px]"
                  style={{
                    color: r.sub ? "#777" : "#bbb",
                    fontSize: r.sub ? 15 : 16,
                    paddingLeft: r.sub ? 16 : 0,
                  }}
                >
                  {r.label}
                </span>
                <span
                  className="text-[16px] font-semibold"
                  style={{ color: r.sub ? "#888" : "#fff" }}
                >
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="shrink-0 px-4 pt-3 flex flex-col gap-2"
          style={{
            paddingBottom: "max(28px, env(safe-area-inset-bottom))",
            background: "#262220",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            className="flex justify-center mb-1 py-1 cursor-pointer"
            onTouchStart={onHandleTouchStart}
            onTouchEnd={onHandleTouchEnd}
            onClick={() => setShowPicker((p) => !p)}
          >
            <div
              style={{
                width: 56,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.3)",
              }}
            />
          </div>
          <div className="flex gap-[2px]">
            <div
              className="rounded-l-2xl overflow-hidden"
              style={{
                background: "#262220",
                border: "1px solid rgba(255,255,255,0.08)",
                width: "28%",
              }}
            >
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={val}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v > 0)
                    setVal(
                      mode === "portion"
                        ? Math.round(v * 2) / 2
                        : Math.round(v),
                    );
                }}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-transparent text-[15px] font-semibold text-right pr-3 outline-none py-[6px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!hasPortion) return;
                const newMode = mode === "g" ? "portion" : "g";
                if (newMode === "portion") {
                  prevGValRef.current = val;
                  setVal(prevPortionValRef.current);
                } else {
                  prevPortionValRef.current = val;
                  setVal(prevGValRef.current);
                }
                setMode(newMode);
              }}
              className="flex-1 rounded-r-2xl flex items-center justify-between px-5 py-[6px] active:opacity-70 transition-opacity"
              style={{
                background: "#262220",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="text-[15px] font-medium"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {unitLabel}
              </span>
              {hasPortion && (
                <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
              )}
            </button>
          </div>
          <button
            onClick={() => onConfirm(qtyG, mode === "portion" ? val : null)}
            disabled={pending}
            className="w-full block py-[15px] rounded-full text-[16px] font-bold active:scale-[0.98] transition-transform"
            style={{
              background: "#74BF7A",
              color: "#ffffff",
              opacity: pending ? 0.6 : 1,
              fontFamily: "var(--font-sans)",
            }}
          >
            {pending ? "Ajout..." : (confirmLabel ?? "Ajouter")}
          </button>
        </div>

        {/* Picker sheet — en dessous de la bottom bar, glisse depuis le bas */}
        {(() => {
          const portionLabel = aliment.portion_nom
            ? `${aliment.portion_nom} (${portionG}g)`
            : `portion (${portionG}g)`;
          const units = hasPortion ? ["g", portionLabel] : ["g"];
          const unitIdx = mode === "g" ? 0 : 1;
          return (
            <div
              className="shrink-0 overflow-hidden"
              style={{
                maxHeight: showPicker ? PICK_ITEM_H * PICK_VISIBLE : 0,
                transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                background: "#262220",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: PICK_ITEM_H * PICK_VISIBLE,
                  position: "relative",
                }}
              >
                {/* Shared center highlight */}
                <div
                  style={{
                    position: "absolute",
                    top:
                      PICK_ITEM_H * PICK_HALF +
                      Math.floor((PICK_ITEM_H - 36) / 2),
                    height: 36,
                    left: 8,
                    right: 8,
                    background: "#303032",
                    borderRadius: 10,
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />
                {/* Left: quantity scroll */}
                <div style={{ width: "50%", position: "relative", zIndex: 1 }}>
                  <QuantityScrollPicker
                    value={val}
                    onChange={setVal}
                    min={1}
                    max={mode === "portion" ? 100 : 2000}
                    step={mode === "portion" ? 0.5 : 1}
                    visible={7}
                    itemHeight={PICK_ITEM_H}
                    hideHighlight
                    bgColor="#262220"
                    gradientHeight={20}
                  />
                </div>
                {/* Right: unit scroll */}
                <div style={{ width: "50%", position: "relative", zIndex: 1 }}>
                  <UnitScrollColumn
                    units={units}
                    value={unitIdx}
                    onChange={(idx) => {
                      const newMode = idx === 0 ? "g" : "portion";
                      if (newMode === "portion") {
                        prevGValRef.current = val;
                        setVal(prevPortionValRef.current);
                      } else {
                        prevPortionValRef.current = val;
                        setVal(prevGValRef.current);
                      }
                      setMode(newMode);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
