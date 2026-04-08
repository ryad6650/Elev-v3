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
        padding: "14px 0",
        borderBottom: "1px solid rgba(74,55,40,0.08)",
        marginBottom: 6,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Mensurations
        </span>
        {editing ? (
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--accent-text)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isPending ? "…" : "Sauvegarder"}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--accent-text)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Modifier
          </button>
        )}
      </div>

      {/* Grille 2 colonnes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
        }}
      >
        {CHAMPS.map(({ key, label }) => (
          <div
            key={key}
            style={{
              background: "rgba(255,255,255,0.5)",
              borderRadius: 10,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: 7,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                marginBottom: 2,
              }}
            >
              {label}
            </div>
            {editing ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
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
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    border: "none",
                  }}
                  placeholder="—"
                />
                <span
                  style={{
                    fontSize: 9,
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
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {values[key] != null ? values[key] : "—"}
                </span>
                {values[key] != null && (
                  <span
                    style={{
                      fontSize: 9,
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
