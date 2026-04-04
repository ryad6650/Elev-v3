"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { upsertPoids } from "@/app/actions/poids";

interface Props {
  defaultDate?: string;
  defaultPoids?: number;
  onClose: () => void;
  onSaved?: (date: string, poids: number) => void;
}

export default function AddPoidsModal({
  defaultDate,
  defaultPoids,
  onClose,
  onSaved,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(defaultDate ?? today);
  const [poids, setPoids] = useState(defaultPoids?.toString() ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const val = parseFloat(poids.replace(",", "."));
    if (isNaN(val) || val < 20 || val > 300) {
      setError("Entrez un poids valide (20–300 kg)");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await upsertPoids(date, val);
        onSaved?.(date, val);
        onClose();
      } catch {
        setError("Erreur lors de la sauvegarde");
      }
    });
  };

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6"
        style={{
          background: "var(--bg-secondary)",
          maxWidth: 520,
          margin: "0 auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            {defaultPoids ? "Modifier le poids" : "Enregistrer le poids"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ background: "var(--bg-card)" }}
          >
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <label className="block mb-4">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Date
          </span>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full mt-1.5 px-4 py-3 rounded-xl text-base"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </label>

        <label className="block mb-6">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Poids (kg)
          </span>
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="78.5"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            className="block w-full mt-1.5 px-4 py-3 rounded-xl text-3xl font-bold text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--accent-text)",
            }}
            autoFocus
          />
        </label>

        {error && (
          <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || !poids}
          className="w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-95"
          style={{
            background:
              isPending || !poids ? "var(--bg-elevated)" : "var(--accent)",
            color: isPending || !poids ? "var(--text-muted)" : "#fff",
          }}
        >
          {isPending ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
