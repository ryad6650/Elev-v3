"use client";

import { useState, useTransition } from "react";
import {
  createCustomAliment,
  updateCustomAliment,
} from "@/app/actions/nutrition";
import type { NutritionAliment } from "@/lib/nutrition-utils";
import BarcodeScanner from "./BarcodeScanner";

interface Props {
  onCreated?: (aliment: NutritionAliment) => void;
  onEdited?: (aliment: NutritionAliment) => void;
  editAliment?: NutritionAliment;
  isForking?: boolean;
}

const BASE_FIELDS = [
  { label: "Nom *", key: "nom" as const, type: "text" },
  { label: "Calories (kcal / 100g) *", key: "cal" as const, type: "number" },
  { label: "Protéines (g)", key: "prot" as const, type: "number" },
  { label: "Glucides (g)", key: "gluc" as const, type: "number" },
  { label: "Lipides (g)", key: "lip" as const, type: "number" },
  { label: "Fibres (g)", key: "fibres" as const, type: "number" },
  { label: "Sucres (g)", key: "sucres" as const, type: "number" },
  { label: "Sel (g)", key: "sel" as const, type: "number" },
] as const;

type ValKey =
  | "nom"
  | "cal"
  | "prot"
  | "gluc"
  | "lip"
  | "fibres"
  | "sucres"
  | "sel"
  | "portionNom"
  | "portionG"
  | "codeBarres";

export default function CustomFoodForm({
  onCreated,
  onEdited,
  editAliment,
  isForking,
}: Props) {
  const isEdit = !!editAliment?.id;
  const isEditMode = isEdit || isForking;
  const [vals, setVals] = useState<Record<ValKey, string>>({
    nom: editAliment?.nom ?? "",
    cal: editAliment?.calories?.toString() ?? "",
    prot: editAliment?.proteines?.toString() ?? "",
    gluc: editAliment?.glucides?.toString() ?? "",
    lip: editAliment?.lipides?.toString() ?? "",
    fibres: editAliment?.fibres?.toString() ?? "",
    sucres: editAliment?.sucres?.toString() ?? "",
    sel: editAliment?.sel?.toString() ?? "",
    portionNom: editAliment?.portion_nom ?? "",
    portionG: editAliment?.taille_portion_g?.toString() ?? "",
    codeBarres: editAliment?.code_barres ?? "",
  });
  const [showBarcode, setShowBarcode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(key: ValKey, val: string) {
    setVals((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit() {
    const cal = parseFloat(vals.cal);
    if (!vals.nom || isNaN(cal)) return;
    setError(null);
    const portionNom = vals.portionNom ? vals.portionNom : null;
    const portionG = vals.portionG ? parseFloat(vals.portionG) : null;
    const prot = vals.prot ? parseFloat(vals.prot) : null;
    const gluc = vals.gluc ? parseFloat(vals.gluc) : null;
    const lip = vals.lip ? parseFloat(vals.lip) : null;
    const fibres = vals.fibres ? parseFloat(vals.fibres) : null;
    const sucres = vals.sucres ? parseFloat(vals.sucres) : null;
    const sel = vals.sel ? parseFloat(vals.sel) : null;
    const codeBarres = showBarcode && vals.codeBarres ? vals.codeBarres : null;

    startTransition(async () => {
      try {
        if (isEdit && editAliment) {
          await updateCustomAliment(
            editAliment.id,
            vals.nom,
            cal,
            prot,
            gluc,
            lip,
            portionNom,
            portionG,
            codeBarres,
            fibres,
            sucres,
            sel,
          );
          onEdited?.({
            ...editAliment,
            nom: vals.nom,
            calories: cal,
            proteines: prot,
            glucides: gluc,
            lipides: lip,
            fibres,
            sucres,
            sel,
            portion_nom: portionNom,
            taille_portion_g: portionG,
            code_barres: codeBarres,
          });
        } else {
          const { id } = await createCustomAliment(
            vals.nom,
            cal,
            prot,
            gluc,
            lip,
            portionNom,
            portionG,
            codeBarres,
            fibres,
            sucres,
            sel,
          );
          onCreated?.({
            id,
            nom: vals.nom,
            calories: cal,
            proteines: prot,
            glucides: gluc,
            lipides: lip,
            fibres,
            sucres,
            sel,
            portion_nom: portionNom,
            taille_portion_g: portionG,
            code_barres: codeBarres,
            is_global: false,
            source: undefined,
          });
        }
      } catch {
        setError("Erreur lors de l'enregistrement. Réessayez.");
      }
    });
  }

  const disabled = pending || !vals.nom || !vals.cal;

  function buttonLabel() {
    if (pending) return isEditMode ? "Enregistrement..." : "Création...";
    if (isEditMode) return "Modifier l'aliment";
    return "Créer l'aliment";
  }

  return (
    <div className="px-4 pb-8 flex flex-col gap-3 overflow-y-auto">
      {BASE_FIELDS.map(({ label, key, type }) => (
        <div key={key}>
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#78716C", letterSpacing: "0.05em" }}
          >
            {label}
          </label>
          <input
            type={type}
            value={vals[key]}
            onChange={(e) => set(key, e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.75)",
              color: "#2C1E14",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          />
        </div>
      ))}

      {/* Section portion */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#78716C" }}
          >
            Nom de la portion
          </label>
          <input
            type="text"
            placeholder="ex: biscuit, tranche"
            value={vals.portionNom}
            onChange={(e) => set("portionNom", e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.75)",
              color: "#2C1E14",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          />
        </div>
        <div className="w-24">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#78716C" }}
          >
            Grammes
          </label>
          <input
            type="number"
            placeholder="ex: 15"
            value={vals.portionG}
            onChange={(e) => set("portionG", e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.75)",
              color: "#2C1E14",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          />
        </div>
      </div>

      {/* Section code-barres */}
      <button
        type="button"
        onClick={() => setShowBarcode((p) => !p)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{
          background: "rgba(255,255,255,0.75)",
          color: "#2C1E14",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {editAliment?.code_barres
          ? "Modifier le code-barres"
          : "Ajouter un code-barres"}
      </button>

      {showBarcode && (
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#78716C" }}
          >
            Code-barres
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="ex: 3017620422003"
              value={vals.codeBarres}
              onChange={(e) => set("codeBarres", e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.75)",
                color: "#2C1E14",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold shrink-0"
              style={{
                background: "linear-gradient(135deg, #1B2E1D, #2d4a2f)",
                color: "#fff",
              }}
            >
              Scanner
            </button>
          </div>
          {showScanner && (
            <BarcodeScanner
              onDetected={(code) => {
                set("codeBarres", code);
                setShowScanner(false);
              }}
              onClose={() => setShowScanner(false)}
            />
          )}
        </div>
      )}

      {error && (
        <p
          className="text-xs font-medium px-1"
          style={{ color: "var(--danger, #EF4444)" }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full h-[42px] rounded-[14px] flex items-center justify-center text-[13px] font-bold text-white mt-3 active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg, #1B2E1D, #2d4a2f)",
          border: "1px solid rgba(116,191,122,0.3)",
          boxShadow: "0 4px 16px rgba(27,46,29,0.5)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {buttonLabel()}
      </button>
    </div>
  );
}
