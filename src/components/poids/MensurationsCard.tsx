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
  { key: "cou", label: "Cou" },
  { key: "tour_taille", label: "Taille" },
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
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
        marginBottom: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Mensurations
        </span>
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={editing && isPending}
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#74BF7A",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {editing ? (isPending ? "…" : "Sauvegarder") : "Modifier"}
        </button>
      </div>

      {/* Grille 2 colonnes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {CHAMPS.map(({ key, label }) => (
          <div
            key={key}
            style={{
              background: "rgba(0,0,0,0.03)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            {editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  className="outline-none"
                  style={{
                    width: "100%",
                    background: "transparent",
                    fontFamily: "var(--font-nunito), sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    border: "none",
                  }}
                  placeholder="—"
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  cm
                </span>
              </div>
            ) : (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-nunito), sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {values[key] != null ? values[key] : "—"}
                </span>
                {values[key] != null && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      fontWeight: 500,
                      marginLeft: 3,
                    }}
                  >
                    cm
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
