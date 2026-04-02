"use client";

import { useState } from "react";
import type { OnboardingData } from "./OnboardingClient";

type Props = {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function StepBienvenue({ data, update, onNext }: Props) {
  const [touched, setTouched] = useState(false);
  const valid = data.prenom.trim().length >= 2;

  const handleNext = () => {
    setTouched(true);
    if (valid) onNext();
  };

  return (
    <div className="flex-1 flex flex-col page-enter">
      <div className="flex-1 flex flex-col justify-center">
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-8"
          style={{ color: "var(--accent)" }}
        >
          ÉLEV
        </p>
        <h1
          className="text-5xl leading-tight mb-4"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Bienvenue.
        </h1>
        <p
          className="mb-12 text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Quelques questions rapides pour personnaliser ton expérience.
        </p>

        <label
          className="block mb-2 text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Ton prénom
        </label>
        <input
          type="text"
          value={data.prenom}
          onChange={(e) => update({ prenom: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          placeholder="Jean"
          autoFocus
          className="w-full text-xl outline-none"
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${touched && !valid ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 10,
            padding: "16px 18px",
            color: "var(--text-primary)",
          }}
        />
        {touched && !valid && (
          <p className="mt-2 text-sm" style={{ color: "var(--danger)" }}>
            Saisis au moins 2 caractères.
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        className="btn-accent w-full py-4 text-base font-semibold rounded-xl transition-transform active:scale-95"
      >
        Continuer →
      </button>
    </div>
  );
}
