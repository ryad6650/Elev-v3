"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { updateObjectifsNutrition } from "@/app/actions/profil";
import type { ProfilData } from "@/lib/profil";

interface Props {
  profil: ProfilData;
}

function calcGlucides(cal: string, prot: string, lip: string): string {
  const kcal = parseFloat(cal);
  const g_prot = parseFloat(prot);
  const g_lip = parseFloat(lip);
  if (!kcal) return "";
  const remaining =
    kcal - (isNaN(g_prot) ? 0 : g_prot * 4) - (isNaN(g_lip) ? 0 : g_lip * 9);
  if (remaining < 0) return "0";
  return Math.round(remaining / 4).toString();
}

export default function ProfilObjectifsForm({ profil }: Props) {
  const [calories, setCalories] = useState(profil.objectif_calories.toString());
  const [proteines, setProteines] = useState(
    profil.objectif_proteines?.toString() ?? "",
  );
  const [glucides, setGlucides] = useState(
    profil.objectif_glucides?.toString() ?? "",
  );
  const [lipides, setLipides] = useState(
    profil.objectif_lipides?.toString() ?? "",
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recalcule les glucides automatiquement
  useEffect(() => {
    setGlucides(calcGlucides(calories, proteines, lipides));
  }, [calories, proteines, lipides]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const cal = parseInt(calories);
    if (!cal || cal < 500) {
      setError("Calories invalides (min 500)");
      return;
    }
    startTransition(async () => {
      try {
        await updateObjectifsNutrition({
          objectif_calories: cal,
          objectif_proteines: proteines ? parseFloat(proteines) : null,
          objectif_glucides: glucides ? parseFloat(glucides) : null,
          objectif_lipides: lipides ? parseFloat(lipides) : null,
        });
        setSuccess(true);
        successTimerRef.current = setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 15,
    width: "100%",
    outline: "none",
  };

  const inputStyleReadonly = {
    ...inputStyle,
    background: "var(--bg-card)",
    color: "var(--text-muted)",
    cursor: "default",
  };

  const editableFields = [
    { label: "Calories (kcal)", value: calories, setter: setCalories },
    { label: "Protéines (g)", value: proteines, setter: setProteines },
    { label: "Lipides (g)", value: lipides, setter: setLipides },
  ];

  return (
    <section
      className="rounded-2xl p-5 mb-4"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Objectifs nutritionnels
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {editableFields.map(({ label, value, setter }) => (
            <div key={label}>
              <label
                className="block text-xs mb-1.5 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="—"
                min={0}
                style={inputStyle}
              />
            </div>
          ))}
          {/* Glucides — calculé automatiquement */}
          <div>
            <label
              className="block text-xs mb-1.5 font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Glucides (g)
              <span className="ml-1 opacity-50 font-normal">auto</span>
            </label>
            <input
              type="number"
              value={glucides}
              readOnly
              tabIndex={-1}
              placeholder="—"
              style={inputStyleReadonly}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={`${success ? "" : "btn-accent"} flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 mt-1`}
          style={
            success
              ? { background: "var(--success)", color: "#fff" }
              : undefined
          }
        >
          {success ? (
            <>
              <Check size={16} /> Enregistré
            </>
          ) : isPending ? (
            "Enregistrement…"
          ) : (
            "Enregistrer"
          )}
        </button>
      </form>
    </section>
  );
}
