"use client";

import { useState, useTransition } from "react";
import { saveMensurations } from "@/app/actions/poids";

export interface MensurationsData {
  cou: number | null;
  tour_taille: number | null;
  poitrine: number | null;
  hanches: number | null;
  bras: number | null;
  cuisse: number | null;
  mollet: number | null;
}

const CHAMPS: { key: keyof MensurationsData; label: string }[] = [
  { key: "cou", label: "Tour de cou" },
  { key: "tour_taille", label: "Tour de taille" },
  { key: "poitrine", label: "Poitrine" },
  { key: "hanches", label: "Hanches" },
  { key: "bras", label: "Bras" },
  { key: "cuisse", label: "Cuisse" },
  { key: "mollet", label: "Mollet" },
];

interface Props {
  initial: MensurationsData;
}

export default function MensurationsCard({ initial }: Props) {
  const [values, setValues] = useState<MensurationsData>(initial);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveMensurations(values);
      setEditing(false);
    });
  };

  return (
    <div
      className="mb-2.5"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
          }}
        >
          Mensurations
        </div>
        {editing ? (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="font-semibold rounded-full transition-colors"
            style={{
              fontSize: "0.68rem",
              padding: "5px 12px",
              color: "var(--accent)",
              background: "var(--accent-bg)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            {isPending ? "…" : "Sauvegarder"}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-semibold rounded-full transition-colors"
            style={{
              fontSize: "0.68rem",
              padding: "5px 12px",
              color: "var(--accent)",
              background: "var(--accent-bg)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            Modifier
          </button>
        )}
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-2 gap-2">
        {CHAMPS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-[10px]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: "0.6rem",
                color: "var(--text-muted)",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="200"
                  value={values[key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [key]: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  className="w-full outline-none bg-transparent"
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                  placeholder="—"
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  cm
                </span>
              </div>
            ) : (
              <div
                className="font-semibold"
                style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}
              >
                {values[key] != null ? `${values[key]} cm` : "—"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
