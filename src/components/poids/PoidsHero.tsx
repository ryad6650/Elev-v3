"use client";

import { useState, useTransition } from "react";
import { upsertPoids } from "@/app/actions/poids";

interface Props {
  poidsActuel: number | null;
  poidsVeille: number | null;
  onSaved?: (date: string, poids: number) => void;
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
      onSaved?.(today, num);
    });
  };

  return (
    <div
      className="mb-2.5"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "16px 18px",
        textAlign: "center",
      }}
    >
      {/* Poids actuel — gros chiffre centré */}
      <div style={{ padding: "4px 0 2px" }}>
        <div>
          <span
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: 56,
              color: "var(--text-primary)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {poidsActuel ?? "—"}
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--text-muted)",
              marginLeft: 2,
            }}
          >
            kg
          </span>
        </div>
        {delta !== null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              color: delta <= 0 ? "#74BF7A" : "#E87C6A",
              background:
                delta <= 0
                  ? "rgba(116,191,122,0.12)"
                  : "rgba(232,124,106,0.12)",
            }}
          >
            {delta <= 0 ? "↓" : "↑"} {Math.abs(delta)} kg
          </div>
        )}
      </div>

      {/* Saisie inline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          justifyContent: "center",
        }}
      >
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
          className="outline-none"
          style={{
            width: 90,
            height: 36,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontFamily: "var(--font-dm-sans)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        />
        <button
          onClick={handleSave}
          disabled={isPending || !value}
          className="active:scale-95 transition-transform"
          style={{
            height: 36,
            padding: "0 16px",
            background: "linear-gradient(135deg, #1B2E1D, #2d4a2f)",
            border: "1px solid rgba(116,191,122,0.25)",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            color: "#FAFAF9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(27,46,29,0.4)",
            opacity: isPending || !value ? 0.5 : 1,
            cursor: isPending || !value ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "…" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p
          style={{
            fontSize: 12,
            marginTop: 8,
            color: "var(--danger)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
