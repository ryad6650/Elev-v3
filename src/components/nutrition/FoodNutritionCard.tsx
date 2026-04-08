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
}

export default memo(function FoodNutritionCard({
  aliment,
  qty,
  cal,
  prot,
  gluc,
  lip,
}: Props) {
  const p100 = aliment.proteines ?? 0;
  const g100 = aliment.glucides ?? 0;
  const l100 = aliment.lipides ?? 0;

  const calP = p100 * 4;
  const calG = g100 * 4;
  const calL = l100 * 9;
  const calTotal = calP + calG + calL || 1;
  const pPct = Math.round((calP / calTotal) * 100);
  const gPct = Math.round((calG / calTotal) * 100);
  const lPct = 100 - pPct - gPct;

  // SVG donut
  const R = 40;
  const C = 2 * Math.PI * R;
  const gLen = (gPct / 100) * C;
  const pLen = (pPct / 100) * C;
  const lLen = (lPct / 100) * C;
  const gOff = 0;
  const pOff = -(gLen + 2);
  const lOff = -(gLen + pLen + 4);

  const maxMacro = Math.max(p100, g100, l100) || 1;

  return (
    <div className="flex flex-col">
      {/* Calories hero */}
      <div
        className="flex flex-col items-center py-4"
        style={{ borderBottom: "1px solid rgba(74,55,40,0.08)" }}
      >
        <span
          className="text-[44px] leading-none tracking-tight"
          style={{ fontFamily: "var(--font-dm-serif)", color: "#4A3728" }}
        >
          {cal}
        </span>
        <span
          className="text-[13px] font-semibold mt-0.5"
          style={{ color: "#78716C" }}
        >
          kcal
        </span>
        <span className="text-[9px] mt-1.5" style={{ color: "#A8A29E" }}>
          pour {Math.round(qty)}g
        </span>
      </div>

      {/* Donut + macros breakdown */}
      <div
        className="flex items-center gap-[18px] py-4"
        style={{ borderBottom: "1px solid rgba(74,55,40,0.08)" }}
      >
        <div className="relative w-[90px] h-[90px] shrink-0">
          <svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            className="w-full h-full"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="45"
              cy="45"
              r={R}
              fill="none"
              stroke="rgba(74,55,40,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="45"
              cy="45"
              r={R}
              fill="none"
              stroke="#9b6b3a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${gLen} ${C - gLen}`}
              strokeDashoffset={gOff}
            />
            <circle
              cx="45"
              cy="45"
              r={R}
              fill="none"
              stroke="#74bf7a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pLen} ${C - pLen}`}
              strokeDashoffset={pOff}
            />
            <circle
              cx="45"
              cy="45"
              r={R}
              fill="none"
              stroke="#c07858"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${lLen} ${C - lLen}`}
              strokeDashoffset={lOff}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[18px] leading-none"
              style={{ fontFamily: "var(--font-dm-serif)", color: "#4A3728" }}
            >
              {aliment.calories}
            </span>
            <span
              className="text-[8px] font-semibold"
              style={{ color: "#A8A29E" }}
            >
              kcal
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          <MacroBar
            color="#9b6b3a"
            name="Glucides"
            value={`${g100} g`}
            pct={g100 / maxMacro}
          />
          <MacroBar
            color="#74bf7a"
            name="Protéines"
            value={`${p100} g`}
            pct={p100 / maxMacro}
          />
          <MacroBar
            color="#c07858"
            name="Lipides"
            value={`${l100} g`}
            pct={l100 / maxMacro}
          />
        </div>
      </div>

      {/* Detail table */}
      <div className="pt-3">
        <p
          className="text-[8px] font-bold tracking-[0.1em] uppercase mb-2"
          style={{ color: "#A8A29E" }}
        >
          Informations pour {Math.round(qty)} g
        </p>
        <DetailRow name="Énergie" val={`${cal} kcal`} />
        <DetailRow name="Protéines" val={`${prot} g`} />
        <DetailRow name="Glucides" val={`${gluc} g`} />
        {aliment.sucres != null && (
          <DetailRow
            name="dont sucres"
            val={`${fmt((aliment.sucres * qty) / 100)} g`}
            sub
          />
        )}
        <DetailRow name="Lipides" val={`${lip} g`} />
        {(aliment.fibres ?? 0) > 0 && (
          <DetailRow
            name="Fibres"
            val={`${fmt(((aliment.fibres ?? 0) * qty) / 100)} g`}
          />
        )}
        {aliment.sel != null && (
          <DetailRow
            name="Sel"
            val={`${fmt((aliment.sel * qty) / 100)} g`}
            last
          />
        )}
      </div>
    </div>
  );
});

function fmt(v: number) {
  if (v < 1 && v > 0) return v.toFixed(2);
  if (v < 10) return v.toFixed(1);
  return Math.round(v);
}

function MacroBar({
  color,
  name,
  value,
  pct,
}: {
  color: string;
  name: string;
  value: string;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <div className="flex-1">
        <p className="text-[9px] font-semibold" style={{ color: "#78716C" }}>
          {name}
        </p>
        <div
          className="h-1 rounded-full mt-[3px]"
          style={{ background: "rgba(74,55,40,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.round(pct * 100)}%`, background: color }}
          />
        </div>
      </div>
      <span
        className="text-[12px] font-bold shrink-0"
        style={{ color: "#4A3728" }}
      >
        {value}
      </span>
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
      className="flex items-center justify-between py-2"
      style={{
        paddingLeft: sub ? 14 : 0,
        borderBottom: last ? "none" : "1px solid rgba(74,55,40,0.06)",
      }}
    >
      <span
        className={sub ? "text-[10px]" : "text-[11px]"}
        style={{ color: sub ? "#A8A29E" : "#78716C" }}
      >
        {name}
      </span>
      <span className="text-[11px] font-bold" style={{ color: "#4A3728" }}>
        {val}
      </span>
    </div>
  );
}
