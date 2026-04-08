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
      style={{
        padding: "12px 0 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderBottom: "1px solid rgba(74,55,40,0.08)",
        marginBottom: 6,
      }}
    >
      {/* Poids actuel — gros chiffre centré */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 52,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {poidsActuel ?? "—"}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          kg
        </span>
      </div>

      {/* Delta badge */}
      {delta !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "3px 10px",
            marginTop: 8,
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: delta <= 0 ? "#74bf7a" : "#E87C6A",
            background:
              delta <= 0 ? "rgba(116,191,122,0.12)" : "rgba(232,124,106,0.12)",
          }}
        >
          {delta <= 0 ? "↓" : "↑"} {Math.abs(delta)} kg cette semaine
        </div>
      )}

      {/* Saisie inline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
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
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid rgba(74,55,40,0.12)",
            background: "rgba(255,255,255,0.5)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            textAlign: "center",
            fontFamily: "var(--font-dm-serif)",
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          kg
        </span>
        <button
          onClick={handleSave}
          disabled={isPending || !value}
          className="active:scale-95 transition-transform"
          style={{
            padding: "10px 18px",
            borderRadius: 14,
            background:
              "linear-gradient(135deg, var(--bar-from), var(--bar-to))",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            border: "none",
            letterSpacing: "0.02em",
            opacity: isPending || !value ? 0.5 : 1,
            cursor: isPending || !value ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "…" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 12, marginTop: 8, color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
