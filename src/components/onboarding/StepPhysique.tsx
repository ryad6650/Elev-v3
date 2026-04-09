"use client";

import type { OnboardingData } from "./OnboardingClient";

type Props = {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

function NumInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit: string;
  placeholder: string;
}) {
  return (
    <div className="mb-6">
      <label
        className="block mb-2 text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          placeholder={placeholder}
          className="flex-1 text-xl outline-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 18px",
            color: "var(--text-primary)",
          }}
        />
        <span
          className="text-sm font-semibold w-8"
          style={{ color: "var(--text-muted)" }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function StepPhysique({ data, update, onNext, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col page-enter">
      <button
        onClick={onBack}
        className="text-2xl mb-8 -ml-1 self-start"
        style={{
          color: "var(--text-muted)",
          background: "none",
          border: "none",
        }}
      >
        ←
      </button>

      <div className="flex-1">
        <h2
          className="text-4xl mb-3"
          style={{
            fontFamily: "var(--font-lora)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Parle-moi de toi
        </h2>
        <p className="mb-10 text-sm" style={{ color: "var(--text-secondary)" }}>
          Ces données permettent de calculer tes besoins énergétiques.
        </p>

        <NumInput
          label="Taille"
          value={data.taille}
          onChange={(v) => update({ taille: v })}
          unit="cm"
          placeholder="175"
        />
        <NumInput
          label="Poids actuel"
          value={data.poids}
          onChange={(v) => update({ poids: v })}
          unit="kg"
          placeholder="75"
        />

        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Ces champs sont optionnels — tu pourras les renseigner plus tard.
        </p>
      </div>

      <button
        onClick={onNext}
        className="btn-accent w-full py-4 text-base font-semibold rounded-xl transition-transform active:scale-95"
      >
        Continuer →
      </button>
    </div>
  );
}
