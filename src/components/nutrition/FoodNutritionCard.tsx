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

function fmt(v: number) {
  if (v < 1 && v > 0) return v.toFixed(2);
  if (v < 10) return v.toFixed(1);
  return Math.round(v);
}

export default memo(function FoodNutritionCard({
  aliment,
  qty,
  cal,
  prot,
  gluc,
  lip,
}: Props) {
  const rows: { name: string; val: string; sub?: boolean; color?: string }[] = [
    { name: "Énergie", val: `${cal} kcal` },
    { name: "Glucides", val: `${gluc} g`, color: "var(--color-carbs)" },
    { name: "Protéines", val: `${prot} g`, color: "var(--color-protein)" },
    { name: "Lipides", val: `${lip} g`, color: "var(--color-fat)" },
  ];
  if (aliment.sucres != null)
    rows.splice(3, 0, {
      name: "dont sucres",
      val: `${fmt((aliment.sucres * qty) / 100)} g`,
      sub: true,
    });
  if ((aliment.fibres ?? 0) > 0)
    rows.push({
      name: "Fibres",
      val: `${fmt(((aliment.fibres ?? 0) * qty) / 100)} g`,
    });
  if (aliment.sel != null)
    rows.push({ name: "Sel", val: `${fmt((aliment.sel * qty) / 100)} g` });

  return (
    <div
      className="rounded-[20px] p-[18px_20px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3"
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          color: "var(--text-muted)",
        }}
      >
        Détails nutritionnels
      </p>
      {rows.map((r, i) => (
        <div
          key={r.name}
          className="flex items-center justify-between py-[10px]"
          style={{
            paddingLeft: r.sub ? 12 : 0,
            borderBottom:
              i === rows.length - 1 ? "none" : "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="text-[15px]"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              color: r.sub ? "var(--text-muted)" : "var(--text-secondary)",
            }}
          >
            {r.name}
          </span>
          <span
            className="text-[15px] font-bold"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              color: r.color ?? "var(--text-primary)",
            }}
          >
            {r.val}
          </span>
        </div>
      ))}
    </div>
  );
});
