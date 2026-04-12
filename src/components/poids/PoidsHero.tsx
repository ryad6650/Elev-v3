"use client";

import { useState, useTransition } from "react";
import { upsertPoids } from "@/app/actions/poids";
import { toast } from "@/store/toastStore";

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
      toast.success("Poids enregistré");
      setValue("");
      onSaved?.(today, num);
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
        padding: "24px 20px",
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Poids actuel */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 52,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {poidsActuel ?? "—"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
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
            padding: "4px 12px",
            marginTop: 10,
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-nunito), sans-serif",
            color: delta <= 0 ? "#74BF7A" : "#c94444",
            background: delta <= 0 ? "var(--green-dim)" : "rgba(201,68,68,0.1)",
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
          marginTop: 18,
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
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.1)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            textAlign: "center",
            fontFamily: "var(--font-nunito), sans-serif",
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
            borderRadius: "var(--radius-sm)",
            background: "#74BF7A",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            fontFamily: "var(--font-nunito), sans-serif",
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
