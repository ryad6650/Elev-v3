"use client";

import { useState, useTransition } from "react";
import {
  createCustomAliment,
  updateCustomAliment,
} from "@/app/actions/nutrition";
import type { NutritionAliment } from "@/lib/nutrition-utils";
import { ScanBarcode } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import {
  Field,
  MacroField,
  SmallField,
  labelStyle,
  inputStyle,
} from "./FoodFormFields";

interface Props {
  onCreated?: (aliment: NutritionAliment) => void;
  onEdited?: (aliment: NutritionAliment) => void;
  editAliment?: NutritionAliment;
  isForking?: boolean;
  onDelete?: () => void;
}

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

const sectionLabel: React.CSSProperties = {
  fontFamily: "var(--font-nunito), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 12,
  marginTop: 8,
};

export default function CustomFoodForm({
  onCreated,
  onEdited,
  editAliment,
  isForking,
  onDelete,
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
  const [showScanner, setShowScanner] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = (key: ValKey, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));
  const num = (v: string) => (v ? parseFloat(v) : null);

  function handleSubmit() {
    const cal = parseFloat(vals.cal);
    if (!vals.nom || isNaN(cal)) return;
    setError(null);
    const payload = {
      nom: vals.nom,
      cal,
      prot: num(vals.prot),
      gluc: num(vals.gluc),
      lip: num(vals.lip),
      fibres: num(vals.fibres),
      sucres: num(vals.sucres),
      sel: num(vals.sel),
      portionNom: vals.portionNom || null,
      portionG: num(vals.portionG),
      codeBarres: vals.codeBarres || null,
    };
    startTransition(async () => {
      try {
        if (isEdit && editAliment) {
          await updateCustomAliment(
            editAliment.id,
            payload.nom,
            payload.cal,
            payload.prot,
            payload.gluc,
            payload.lip,
            payload.portionNom,
            payload.portionG,
            payload.codeBarres,
            payload.fibres,
            payload.sucres,
            payload.sel,
          );
          onEdited?.({
            ...editAliment,
            nom: payload.nom,
            calories: payload.cal,
            proteines: payload.prot,
            glucides: payload.gluc,
            lipides: payload.lip,
            fibres: payload.fibres,
            sucres: payload.sucres,
            sel: payload.sel,
            portion_nom: payload.portionNom,
            taille_portion_g: payload.portionG,
            code_barres: payload.codeBarres,
          });
        } else {
          const { id } = await createCustomAliment(
            payload.nom,
            payload.cal,
            payload.prot,
            payload.gluc,
            payload.lip,
            payload.portionNom,
            payload.portionG,
            payload.codeBarres,
            payload.fibres,
            payload.sucres,
            payload.sel,
          );
          onCreated?.({
            id,
            nom: payload.nom,
            calories: payload.cal,
            proteines: payload.prot,
            glucides: payload.gluc,
            lipides: payload.lip,
            fibres: payload.fibres,
            sucres: payload.sucres,
            sel: payload.sel,
            portion_nom: payload.portionNom,
            taille_portion_g: payload.portionG,
            code_barres: payload.codeBarres,
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

  return (
    <div className="px-7 pb-8 flex flex-col gap-0 overflow-y-auto">
      <Field label="Nom" value={vals.nom} onChange={(v) => set("nom", v)} />

      {/* Code-barres */}
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Code-barres</div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Optionnel"
            value={vals.codeBarres}
            onChange={(e) => set("codeBarres", e.target.value)}
            className="outline-none"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-sm)",
              background: "var(--green-dim)",
              border: "1px solid rgba(42,157,110,0.15)",
              cursor: "pointer",
            }}
          >
            <ScanBarcode size={20} style={{ color: "var(--green)" }} />
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

      <div style={sectionLabel}>Valeurs pour 100g</div>
      <MacroField
        label="Calories"
        value={vals.cal}
        onChange={(v) => set("cal", v)}
        unit="kcal"
      />
      <MacroField
        label="Glucides"
        value={vals.gluc}
        onChange={(v) => set("gluc", v)}
        unit="g"
        dot="var(--color-carbs)"
      />
      <MacroField
        label="Protéines"
        value={vals.prot}
        onChange={(v) => set("prot", v)}
        unit="g"
        dot="var(--color-protein)"
      />
      <MacroField
        label="Lipides"
        value={vals.lip}
        onChange={(v) => set("lip", v)}
        unit="g"
        dot="var(--color-fat)"
      />

      <div className="flex gap-2.5" style={{ marginBottom: 16 }}>
        <SmallField
          label="Sucres"
          value={vals.sucres}
          onChange={(v) => set("sucres", v)}
        />
        <SmallField
          label="Fibres"
          value={vals.fibres}
          onChange={(v) => set("fibres", v)}
        />
        <SmallField
          label="Sel"
          value={vals.sel}
          onChange={(v) => set("sel", v)}
        />
      </div>

      <div style={sectionLabel}>Portion</div>
      <div className="flex gap-2.5" style={{ marginBottom: 16 }}>
        <div style={{ flex: 2 }}>
          <div style={labelStyle}>Nom de la portion</div>
          <input
            type="text"
            placeholder="Ex: 1 tranche, 1 cuillère..."
            value={vals.portionNom}
            onChange={(e) => set("portionNom", e.target.value)}
            className="outline-none"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Taille (g)</div>
          <input
            type="number"
            placeholder="40"
            value={vals.portionG}
            onChange={(e) => set("portionG", e.target.value)}
            className="outline-none"
            style={inputStyle}
          />
        </div>
      </div>

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
        className="w-full flex items-center justify-center text-[15px] font-semibold text-white mt-3 active:scale-[0.98] transition-transform"
        style={{
          padding: 16,
          background: "var(--green)",
          borderRadius: "var(--radius-sm)",
          border: "none",
          opacity: disabled ? 0.5 : 1,
          fontFamily: "var(--font-nunito), sans-serif",
          cursor: "pointer",
        }}
      >
        {pending
          ? isEditMode
            ? "Enregistrement..."
            : "Création..."
          : isEditMode
            ? "Sauvegarder"
            : "Créer l'aliment"}
      </button>

      {isEdit && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full text-[13px] font-semibold mt-2"
          style={{
            padding: 14,
            borderRadius: "var(--radius-sm)",
            background: "none",
            border: "none",
            color: "#c94444",
            fontFamily: "var(--font-nunito), sans-serif",
            cursor: "pointer",
          }}
        >
          Supprimer cet aliment
        </button>
      )}
    </div>
  );
}
