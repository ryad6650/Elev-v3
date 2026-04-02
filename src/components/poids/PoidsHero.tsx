"use client";

import { useState, useTransition } from "react";
import { upsertPoids } from "@/app/actions/poids";

interface Props {
  poidsActuel: number | null;
  poidsVeille: number | null;
  onSaved?: () => void;
}

export default function PoidsHero({
  poidsActuel,
  poidsVeille,
  onSaved,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const delta =
    poidsActuel !== null && poidsVeille !== null
      ? Math.round((poidsActuel - poidsVeille) * 10) / 10
      : null;

  const handleSave = () => {
    const num = parseFloat(value.replace(",", "."));
    if (isNaN(num) || num < 20 || num > 300) {
      setError("Poids invalide");
      return;
    }
    setError("");
    startTransition(async () => {
      await upsertPoids(today, num);
      setValue("");
      onSaved?.();
    });
  };

  return (
    <div
      className="rounded-2xl p-5 mb-3"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Affichage poids actuel */}
      <div className="flex items-end gap-2 mb-3.5">
        <div
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "3.2rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {poidsActuel ?? "—"}
        </div>
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            paddingBottom: 6,
          }}
        >
          kg
        </div>
        {delta !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: delta <= 0 ? "#4ADE80" : "#EF4444",
              paddingBottom: 8,
              marginLeft: 4,
            }}
          >
            {delta <= 0 ? "↓" : "↑"} {Math.abs(delta)} kg
          </div>
        )}
      </div>

      {/* Saisie inline */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder={poidsActuel ? String(poidsActuel) : "0.0"}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-full outline-none"
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "10px 36px 10px 14px",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          />
          <span
            className="absolute right-3"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-muted)",
            }}
          >
            kg
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || !value}
          className="btn-accent active:scale-95 transition-transform font-bold whitespace-nowrap"
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: "0.82rem",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(232,134,12,0.35)",
            opacity: isPending || !value ? 0.6 : 1,
            cursor: isPending || !value ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "…" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
