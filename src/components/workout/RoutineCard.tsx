"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Routine } from "@/lib/workout";

interface Props {
  routine: Routine;
  onOptions: () => void;
  onStart: () => Promise<void> | void;
  onView: () => void;
}

export default function RoutineCard({
  routine,
  onOptions,
  onStart,
  onView,
}: Props) {
  const [isStarting, setIsStarting] = useState(false);
  const exerciceText = routine.exerciceNoms.join(", ");

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStarting) return;
    setIsStarting(true);
    try {
      await onStart();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div
      onClick={onView}
      style={{
        background: "#262220",
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
          aria-label="Options de la routine"
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
        onClick={handleStart}
        disabled={isStarting}
        className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 ${isStarting ? "scale-[0.97] opacity-80" : "active:scale-[0.97]"}`}
        style={{
          background: "#74BF7A",
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 15,
          color: "white",
          border: "none",
        }}
      >
        {isStarting ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="animate-spin rounded-full border-2"
              style={{
                width: 16,
                height: 16,
                borderColor: "rgba(255,255,255,0.3)",
                borderTopColor: "white",
              }}
            />
            Chargement...
          </span>
        ) : (
          "Commencer la Routine"
        )}
      </button>
    </div>
  );
}
