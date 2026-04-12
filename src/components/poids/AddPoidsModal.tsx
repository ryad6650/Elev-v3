"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { upsertPoids } from "@/app/actions/poids";
import { toast } from "@/store/toastStore";

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
        toast.success("Poids enregistré");
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
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6"
        style={{
          background: "linear-gradient(to bottom, #e8e6e2, #f3f0ea)",
          maxWidth: 430,
          margin: "0 auto",
          colorScheme: "light",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#1c1917",
            }}
          >
            {defaultPoids ? "Modifier le poids" : "Enregistrer le poids"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ background: "rgba(0,0,0,0.04)" }}
            aria-label="Fermer"
          >
            <X size={18} style={{ color: "#78716c" }} />
          </button>
        </div>

        <label className="block mb-4">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              color: "#78716c",
            }}
          >
            Date
          </span>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full mt-1.5 px-4 py-3 rounded-xl text-base outline-none"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.12)",
              color: "#1c1917",
              colorScheme: "light",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          />
        </label>

        <label className="block mb-6">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              color: "#78716c",
            }}
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
            className="block w-full mt-1.5 px-4 py-3 rounded-xl text-3xl font-bold text-center outline-none"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.12)",
              color: "#1c1917",
              colorScheme: "light",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
            autoFocus
          />
        </label>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#c94444" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || !poids}
          className="w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            background: isPending || !poids ? "rgba(0,0,0,0.06)" : "#74BF7A",
            color: isPending || !poids ? "var(--text-muted)" : "#fff",
            border: "none",
            cursor: isPending || !poids ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
