"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "@/app/actions/onboarding";
import type { OnboardingData } from "./OnboardingClient";

type Props = {
  data: OnboardingData;
  onBack: () => void;
};

const OBJECTIF_LABELS: Record<OnboardingData["objectif"], string> = {
  masse: "💪 Prise de masse",
  perte: "🔥 Perte de poids",
  maintien: "⚖️ Maintien",
  performance: "🏃 Performance",
};

export default function StepPret({ data, onBack }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsPending(true);
    setError(null);
    try {
      await saveOnboarding({
        prenom: data.prenom,
        taille: data.taille,
        poids: data.poids,
        objectif_calories: data.objectif_calories,
        objectif_proteines: data.objectif_proteines,
        objectif_glucides: data.objectif_glucides,
        objectif_lipides: data.objectif_lipides,
      });
      router.push("/dashboard");
    } catch (err) {
      setIsPending(false);
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  };

  const recap = [
    { label: "Prénom", value: data.prenom },
    { label: "Taille", value: data.taille ? `${data.taille} cm` : "—" },
    { label: "Poids", value: data.poids ? `${data.poids} kg` : "—" },
    { label: "Objectif", value: OBJECTIF_LABELS[data.objectif] },
    { label: "Calories cibles", value: `${data.objectif_calories} kcal/j` },
  ];

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
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          C&apos;est parti, {data.prenom} !
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Voici un récapitulatif de ton profil.
        </p>

        <div className="flex flex-col gap-2">
          {recap.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p
            className="mt-4 text-sm text-center"
            style={{ color: "var(--danger)" }}
          >
            {error}
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className={`w-full py-4 mt-6 text-base font-semibold rounded-xl transition-all active:scale-95 ${isPending ? "" : "btn-accent"}`}
        style={
          isPending
            ? {
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }
            : undefined
        }
      >
        {isPending ? "Enregistrement…" : "Commencer Élev →"}
      </button>
    </div>
  );
}
