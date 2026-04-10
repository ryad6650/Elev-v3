"use client";

import { MoreVertical } from "lucide-react";
import type { Routine } from "@/lib/workout";

interface Props {
  routine: Routine;
  onOptions: () => void;
  onStart: () => void;
  onView: () => void;
}

export default function RoutineCard({
  routine,
  onOptions,
  onStart,
  onView,
}: Props) {
  const exerciceText = routine.exerciceNoms.join(", ");

  return (
    <div
      onClick={onView}
      style={{
        background: "#1C1C1E",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "16px",
        cursor: "pointer",
      }}
    >
      {/* Header: titre + menu */}
      <div className="flex items-start justify-between mb-2">
        <p
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            flex: 1,
            marginRight: 8,
          }}
        >
          {routine.nom}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOptions();
          }}
          className="p-0.5 active:opacity-70 shrink-0 mt-0.5"
        >
          <MoreVertical size={20} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Aperçu exercices */}
      {exerciceText && (
        <p
          className="mb-4"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {exerciceText}
        </p>
      )}

      {/* Bouton Commencer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="w-full py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition-transform"
        style={{
          background: "var(--accent)",
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 15,
          color: "white",
          border: "none",
        }}
      >
        Commencer la Routine
      </button>
    </div>
  );
}
