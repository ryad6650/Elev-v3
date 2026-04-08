"use client";

import { memo } from "react";
import type { NutritionAliment } from "@/lib/nutrition-utils";

interface Props {
  aliment: NutritionAliment;
  qty: number;
  cal: number;
  prot: number;
  gluc: number;
  lip: number;
  showDetails: boolean;
  onToggleDetails: () => void;
}

export default memo(function FoodNutritionCard({
  aliment,
  qty,
  cal,
  prot,
  gluc,
  lip,
  showDetails,
  onToggleDetails,
}: Props) {
  const p100 = aliment.proteines ?? 0;
  const g100 = aliment.glucides ?? 0;
  const l100 = aliment.lipides ?? 0;
  const f100 = aliment.fibres ?? 0;

  const calP = p100 * 4;
  const calG = g100 * 4;
  const calL = l100 * 9;
  const calTotal = calP + calG + calL || 1;
  const pPct = Math.round((calP / calTotal) * 100);
  const gPct = Math.round((calG / calTotal) * 100);
  const lPct = 100 - pPct - gPct;

  // SVG donut segments
  const R = 32;
  const C = 2 * Math.PI * R;
  const gLen = (gPct / 100) * C;
  const pLen = (pPct / 100) * C;
  const lLen = (lPct / 100) * C;
  const gOff = 0;
  const pOff = -(gLen + 2);
  const lOff = -(gLen + pLen + 4);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Portion summary card */}
      <div
        className="rounded-2xl p-3.5"
        style={{
          background:
            "linear-gradient(135deg, rgba(27,46,29,0.15), rgba(27,46,29,0.08))",
          border: "1px solid rgba(27,46,29,0.2)",
        }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5"
          style={{ color: "rgba(0,0,0,0.35)" }}
        >
          Pour {Math.round(qty)}g
        </p>
        <div>
          <span
            className="text-[42px] leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "#2C1E14",
            }}
          >
            {cal}
          </span>
          <span
            className="text-sm font-medium ml-1"
            style={{ color: "#78716C" }}
          >
            kcal
          </span>
        </div>
        <div className="flex gap-2.5 mt-2">
          <MacroTag letter="G" value={`${gluc}g`} color="var(--color-carbs)" />
          <MacroTag
            letter="P"
            value={`${prot}g`}
            color="var(--color-protein)"
          />
          <MacroTag letter="L" value={`${lip}g`} color="var(--color-fat)" />
        </div>
      </div>

      {/* Ring + macro list + bar + grid */}
      <div
        className="rounded-[18px] p-4"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div className="flex items-center gap-4 mb-3.5">
          {/* Donut ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke="var(--color-carbs)"
                strokeWidth="6"
                strokeDasharray={`${gLen} ${C - gLen}`}
                strokeDashoffset={gOff}
                strokeLinecap="round"
              />
              <circle
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke="var(--color-protein)"
                strokeWidth="6"
                strokeDasharray={`${pLen} ${C - pLen}`}
                strokeDashoffset={pOff}
                strokeLinecap="round"
              />
              <circle
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke="var(--color-fat)"
                strokeWidth="6"
                strokeDasharray={`${lLen} ${C - lLen}`}
                strokeDashoffset={lOff}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-base font-extrabold leading-none"
                style={{ color: "#2C1E14" }}
              >
                {aliment.calories}
              </span>
              <span
                className="text-[7px] font-semibold tracking-wide mt-0.5"
                style={{ color: "#78716C" }}
              >
                kcal/100g
              </span>
            </div>
          </div>

          {/* Macro list */}
          <div className="flex-1 flex flex-col gap-1.5">
            <MacroRow
              dot="var(--color-carbs)"
              name="Glucides"
              grams={`${g100}g`}
              pct={`${gPct}%`}
            />
            <MacroRow
              dot="var(--color-protein)"
              name="Protéines"
              grams={`${p100}g`}
              pct={`${pPct}%`}
            />
            <MacroRow
              dot="var(--color-fat)"
              name="Lipides"
              grams={`${l100}g`}
              pct={`${lPct}%`}
            />
            {f100 > 0 && (
              <MacroRow dot="#22C55E" name="Fibres" grams={`${f100}g`} pct="" />
            )}
          </div>
        </div>

        {/* Stacked bar */}
        <div className="h-1.5 rounded-full flex gap-0.5 overflow-hidden mb-3">
          <div
            className="h-full rounded-full"
            style={{ flex: gPct, background: "var(--color-carbs)" }}
          />
          <div
            className="h-full rounded-full"
            style={{ flex: pPct, background: "var(--color-protein)" }}
          />
          <div
            className="h-full rounded-full"
            style={{ flex: lPct, background: "var(--color-fat)" }}
          />
        </div>

        {/* Macro grid */}
        <div className="grid grid-cols-3 gap-2">
          <MacroCell
            value={`${g100}g`}
            label="Glucides"
            color="var(--color-carbs)"
          />
          <MacroCell
            value={`${p100}g`}
            label="Protéines"
            color="var(--color-protein)"
          />
          <MacroCell
            value={`${l100}g`}
            label="Lipides"
            color="var(--color-fat)"
          />
        </div>
      </div>

      {/* Detail table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div
          className="flex items-center justify-between px-3.5 py-2.5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "#78716C" }}
          >
            Détails /100g
          </span>
          <button
            onClick={onToggleDetails}
            className="text-[10px] font-semibold"
            style={{ color: "var(--accent-text)" }}
          >
            {showDetails ? "− Moins" : "+ Voir tout"}
          </button>
        </div>
        {showDetails && (
          <div>
            <DetailRow name="Énergie" val={`${aliment.calories} kcal`} />
            <DetailRow name="Glucides" val={`${g100}g`} />
            {aliment.sucres != null && (
              <DetailRow name="dont sucres" val={`${aliment.sucres}g`} sub />
            )}
            <DetailRow name="Protéines" val={`${p100}g`} />
            <DetailRow name="Lipides" val={`${l100}g`} />
            {f100 > 0 && <DetailRow name="Fibres" val={`${f100}g`} />}
            {aliment.sel != null && (
              <DetailRow name="Sel" val={`${aliment.sel}g`} last />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/* ---- Sub-components ---- */

function MacroTag({
  letter,
  value,
  color,
}: {
  letter: string;
  value: string;
  color: string;
}) {
  return (
    <span className="text-[11px] font-bold">
      <span className="font-extrabold" style={{ color }}>
        {letter}
      </span>{" "}
      <span style={{ color: "rgba(0,0,0,0.55)", fontWeight: 500 }}>
        {value}
      </span>
    </span>
  );
}

function MacroRow({
  dot,
  name,
  grams,
  pct,
}: {
  dot: string;
  name: string;
  grams: string;
  pct: string;
}) {
  return (
    <div className="flex items-center gap-[7px]">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: dot }}
      />
      <span
        className="text-[11px] font-medium flex-1"
        style={{ color: "#5A4A3A" }}
      >
        {name}
      </span>
      <span className="text-[11px] font-bold" style={{ color: "#2C1E14" }}>
        {grams}
      </span>
      {pct && (
        <span
          className="text-[9px] font-semibold min-w-7 text-right"
          style={{ color: "#78716C" }}
        >
          {pct}
        </span>
      )}
    </div>
  );
}

function MacroCell({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl py-2.5 px-2 text-center"
      style={{
        background: "rgba(0,0,0,0.03)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <p
        className="text-lg font-extrabold leading-none tracking-tight"
        style={{ color }}
      >
        {value}
      </p>
      <p
        className="text-[8px] font-bold tracking-[0.1em] uppercase mt-1"
        style={{ color: "#78716C" }}
      >
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  name,
  val,
  sub,
  last,
}: {
  name: string;
  val: string;
  sub?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: sub ? "7px 14px 7px 26px" : "7px 14px",
        borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <span
        className="text-[11px] font-medium"
        style={{ color: sub ? "#A8A29E" : "#5A4A3A" }}
      >
        {name}
      </span>
      <span
        className="text-[11px] font-bold"
        style={{ color: sub ? "#78716C" : "#2C1E14" }}
      >
        {val}
      </span>
    </div>
  );
}
