"use client";

import { useState } from "react";
import StepBienvenue from "./StepBienvenue";
import StepPhysique from "./StepPhysique";
import StepObjectif from "./StepObjectif";
import StepNutrition from "./StepNutrition";
import StepPret from "./StepPret";

export type ObjectifType = "masse" | "perte" | "maintien" | "performance";

export type OnboardingData = {
  prenom: string;
  taille: number | null;
  poids: number | null;
  objectif: ObjectifType;
  objectif_calories: number;
  objectif_proteines: number | null;
  objectif_glucides: number | null;
  objectif_lipides: number | null;
};

const INITIAL_DATA: OnboardingData = {
  prenom: "",
  taille: null,
  poids: null,
  objectif: "maintien",
  objectif_calories: 2200,
  objectif_proteines: 160,
  objectif_glucides: 250,
  objectif_lipides: 70,
};

export default function OnboardingClient() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Barre de progression */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: s <= step ? "var(--accent)" : "var(--bg-elevated)",
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Étape {step} sur 5
        </p>
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {step === 1 && (
          <StepBienvenue data={data} update={update} onNext={next} />
        )}
        {step === 2 && (
          <StepPhysique
            data={data}
            update={update}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <StepObjectif
            data={data}
            update={update}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <StepNutrition
            data={data}
            update={update}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 5 && <StepPret data={data} onBack={back} />}
      </div>
    </main>
  );
}
