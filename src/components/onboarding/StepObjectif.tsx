"use client";

import type { OnboardingData, ObjectifType } from "./OnboardingClient";

type Props = {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const OPTIONS: {
  value: ObjectifType;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "masse",
    emoji: "💪",
    label: "Prise de masse",
    desc: "Développer mes muscles et prendre du volume",
  },
  {
    value: "perte",
    emoji: "🔥",
    label: "Perte de poids",
    desc: "Perdre du gras tout en préservant les muscles",
  },
  {
    value: "maintien",
    emoji: "⚖️",
    label: "Maintien",
    desc: "Garder ma forme et composition actuelles",
  },
  {
    value: "performance",
    emoji: "🏃",
    label: "Performance",
    desc: "Améliorer mes capacités sportives",
  },
];

function getSuggestion(objectif: ObjectifType, poids: number | null) {
  const p = poids ?? 75;
  const base = Math.round(p * 30);
  switch (objectif) {
    case "masse":
      return {
        cal: base + 300,
        prot: Math.round(p * 2),
        gluc: Math.round(((base + 300) * 0.45) / 4),
        lip: Math.round(((base + 300) * 0.25) / 9),
      };
    case "perte":
      return {
        cal: Math.max(1400, base - 400),
        prot: Math.round(p * 2.2),
        gluc: Math.round(((base - 400) * 0.4) / 4),
        lip: Math.round(((base - 400) * 0.3) / 9),
      };
    case "performance":
      return {
        cal: base + 500,
        prot: Math.round(p * 1.8),
        gluc: Math.round(((base + 500) * 0.5) / 4),
        lip: Math.round(((base + 500) * 0.25) / 9),
      };
    default:
      return {
        cal: base,
        prot: Math.round(p * 1.6),
        gluc: Math.round((base * 0.45) / 4),
        lip: Math.round((base * 0.3) / 9),
      };
  }
}

export default function StepObjectif({ data, update, onNext, onBack }: Props) {
  const handleSelect = (objectif: ObjectifType) => {
    const s = getSuggestion(objectif, data.poids);
    update({
      objectif,
      objectif_calories: s.cal,
      objectif_proteines: s.prot,
      objectif_glucides: s.gluc,
      objectif_lipides: s.lip,
    });
  };

  return (
    <div className="flex-1 flex flex-col page-enter">
      <button
        onClick={onBack}
        className="text-2xl mb-8 -ml-1 self-start"
        style={{ color: "var(--text-muted)", background: "none", border: "none" }}
      >
        ←
      </button>

      <div className="flex-1">
        <h2
          className="text-4xl mb-3"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Ton objectif
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          On adaptera tes recommandations et objectifs nutritionnels.
        </p>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const selected = data.objectif === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: selected ? "var(--accent-bg)" : "var(--bg-secondary)",
                  border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {opt.desc}
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: selected ? "var(--accent)" : "var(--bg-elevated)",
                    border: selected ? "none" : "1px solid var(--border)",
                  }}
                >
                  {selected && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 mt-6 text-base font-semibold transition-transform active:scale-95"
        style={{ background: "var(--accent)", color: "#fff", borderRadius: 12 }}
      >
        Continuer →
      </button>
    </div>
  );
}
