"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { calcNutrients } from "@/lib/nutrition-utils";
import type { NutritionEntry } from "@/lib/nutrition-utils";

interface Props {
  entry: NutritionEntry;
  onClose: () => void;
}

export default function FoodViewSheet({ entry, onClose }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const aliment = entry.aliment;
  const n = calcNutrients(aliment, entry.quantite_g);

  const calP = (aliment.proteines ?? 0) * 4;
  const calG = (aliment.glucides ?? 0) * 4;
  const calL = (aliment.lipides ?? 0) * 9;
  const calTotal = calP + calG + calL || 1;
  const pPct = Math.round((calP / calTotal) * 100);
  const gPct = Math.round((calG / calTotal) * 100);
  const lPct = Math.round((calL / calTotal) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[430px] px-3 mb-24 flex flex-col">
        <div
          className="rounded-3xl flex flex-col w-full overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            maxHeight: "calc(100dvh - 165px - env(safe-area-inset-top, 20px))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
            <div className="w-7" />
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Fiche produit
            </p>
            <button onClick={onClose} className="p-1">
              <X size={20} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* Scrollable */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-6"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Identity */}
            <div className="flex flex-col items-center pb-5 pt-1">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-3"
                style={{
                  background: "var(--accent-bg)",
                  color: "var(--accent-text)",
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                }}
              >
                {aliment.nom.charAt(0).toUpperCase()}
              </div>
              <p
                className="text-center text-xl leading-snug"
                style={{
                  fontFamily: "var(--font-lora)",
                  fontStyle: "italic",
                  color: "var(--text-primary)",
                }}
              >
                {aliment.nom}
              </p>
              {aliment.marque && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {aliment.marque}
                </p>
              )}
              <p
                className="text-xs mt-2 font-medium"
                style={{ color: "var(--accent-text)" }}
              >
                {entry.quantite_g}g consommés
              </p>
            </div>

            {/* Résumé pour la quantité consommée */}
            <div
              className="rounded-2xl p-4 mb-3"
              style={{
                background: "var(--accent-bg)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
              }}
            >
              <p
                className="text-center text-xs font-semibold mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Pour {entry.quantite_g}g
              </p>
              <p
                className="text-center text-2xl font-extrabold"
                style={{ color: "var(--accent-text)" }}
              >
                {n.calories} <span className="text-sm font-semibold">kcal</span>
              </p>
              <div className="flex justify-center gap-4 mt-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-protein)" }}
                >
                  P {n.proteines}g
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-carbs)" }}
                >
                  G {n.glucides}g
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-fat)" }}
                >
                  L {n.lipides}g
                </span>
              </div>
            </div>

            {/* Ring + breakdown pour 100g */}
            <div
              className="rounded-2xl p-4 mb-3 relative"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowDetails((d) => !d)}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--accent-text)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {showDetails ? "− Moins" : "+ d'infos"}
                </button>
              </div>
              <p
                className="text-[10px] font-bold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Pour 100g
              </p>
              <div className="flex items-center gap-5">
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
                      r="34"
                      fill="none"
                      stroke="#3a3532"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-xl font-extrabold leading-none"
                      style={{ color: "var(--accent-text)" }}
                    >
                      {aliment.calories}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-wide mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      kcal
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    {
                      dot: "#3B82F6",
                      label: "Protéines",
                      val: aliment.proteines,
                      pct: pPct,
                    },
                    {
                      dot: "#EAB308",
                      label: "Glucides",
                      val: aliment.glucides,
                      pct: gPct,
                    },
                    {
                      dot: "#EF4444",
                      label: "Lipides",
                      val: aliment.lipides,
                      pct: lPct,
                    },
                    {
                      dot: "#22C55E",
                      label: "Fibres",
                      val: aliment.fibres ?? null,
                      pct: null,
                    },
                  ].map(({ dot, label, val, pct }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: dot }}
                      />
                      <span
                        className="text-[11px] w-14 shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {val ?? 0}g
                      </span>
                      {pct !== null && (
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {pct}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Macro bar */}
            <div className="mb-3">
              <div
                className="h-2.5 rounded-full flex gap-0.5 mb-3 overflow-hidden"
                style={{ background: "#3a3532" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pPct}%`,
                    background: "#3B82F6",
                    opacity: 0.85,
                  }}
                />
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${gPct}%`,
                    background: "#EAB308",
                    opacity: 0.85,
                  }}
                />
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${lPct}%`,
                    background: "#EF4444",
                    opacity: 0.85,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Protéines",
                    v: aliment.proteines ?? 0,
                    c: "#93C5FD",
                  },
                  { label: "Glucides", v: aliment.glucides ?? 0, c: "#FDE047" },
                  { label: "Lipides", v: aliment.lipides ?? 0, c: "#FCA5A5" },
                ].map(({ label, v, c }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p
                      className="text-lg font-extrabold leading-none"
                      style={{ color: c }}
                    >
                      {v}
                      <span className="text-xs font-medium">g</span>
                    </p>
                    <p
                      className="text-[10px] mt-1.5 font-semibold uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Table nutritionnelle détaillée */}
            {showDetails && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {[
                  {
                    label: "Énergie",
                    val: `${aliment.calories} kcal`,
                    hl: true,
                  },
                  { label: "Protéines", val: `${aliment.proteines ?? 0} g` },
                  { label: "Glucides", val: `${aliment.glucides ?? 0} g` },
                  {
                    label: "dont sucres",
                    val: aliment.sucres != null ? `${aliment.sucres} g` : "—",
                    sub: true,
                  },
                  { label: "Lipides", val: `${aliment.lipides ?? 0} g` },
                  {
                    label: "Fibres",
                    val: aliment.fibres != null ? `${aliment.fibres} g` : "—",
                  },
                  {
                    label: "Sel",
                    val: aliment.sel != null ? `${aliment.sel} g` : "—",
                  },
                ].map(({ label, val, hl, sub }, i, a) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                    style={{
                      padding: sub ? "10px 16px 10px 32px" : "10px 16px",
                      borderBottom:
                        i < a.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{
                        color: sub
                          ? "var(--text-muted)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: hl
                          ? "var(--accent-text)"
                          : sub
                            ? "var(--text-secondary)"
                            : "var(--text-primary)",
                        fontWeight: hl ? 700 : 600,
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
