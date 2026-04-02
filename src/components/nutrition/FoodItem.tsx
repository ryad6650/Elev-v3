"use client";

import { Trash2 } from "lucide-react";
import { deleteNutritionEntry } from "@/app/actions/nutrition";
import { calcNutrients } from "@/lib/nutrition-utils";
import type { NutritionEntry } from "@/lib/nutrition-utils";

interface Props {
  entry: NutritionEntry;
  onDeleted?: (id: string) => void;
  onClick?: () => void;
}

export default function FoodItem({ entry, onDeleted, onClick }: Props) {
  const n = calcNutrients(entry.aliment, entry.quantite_g);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDeleted?.(entry.id);
    deleteNutritionEntry(entry.id).catch(console.error);
  }

  return (
    <div
      className="flex items-center gap-2 py-2.5 transition-colors active:bg-[var(--bg-card)]"
      style={{
        borderBottom:
          "1px solid color-mix(in srgb, var(--border) 100%, var(--text-muted) 25%)",
        cursor: onClick ? "pointer" : undefined,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {entry.aliment.nom}
        </p>
        <p
          className="text-xs tabular-nums mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {entry.quantite_g}g · P {n.proteines}g · G {n.glucides}g · L{" "}
          {n.lipides}g
        </p>
      </div>
      <p
        className="text-xs font-semibold tabular-nums shrink-0"
        style={{ color: "var(--accent)" }}
      >
        {n.calories} kcal
      </p>
      <button
        onClick={handleDelete}
        className="p-2.5 -mr-1 rounded-xl shrink-0 transition-all active:scale-90"
        style={{
          color: "#ef4444",
          background: "rgba(239, 68, 68, 0.1)",
        }}
        aria-label="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
