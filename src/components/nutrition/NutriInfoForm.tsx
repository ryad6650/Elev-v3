"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, X, ChevronRight } from "lucide-react";
import {
  createCustomAliment,
  updateCustomAliment,
} from "@/app/actions/nutrition";
import type { NutritionAliment } from "@/lib/nutrition-utils";

const SF =
  "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif";
const SEP = { borderBottom: "1px solid rgba(255,255,255,0.1)" } as const;

type Vals = Record<
  | "nom"
  | "cal"
  | "prot"
  | "gluc"
  | "lip"
  | "sucres"
  | "fibres"
  | "sel"
  | "portionNom"
  | "portionG",
  string
>;

interface Props {
  editAliment?: NutritionAliment;
  isForking?: boolean;
  onEdited?: (a: NutritionAliment) => void;
  onCreated?: (a: NutritionAliment) => void;
  onBack: () => void;
  onClose: () => void;
}

function Row({
  label,
  bold,
  value,
  onChange,
  required,
  text,
  noBorder,
}: {
  label: string;
  bold?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  text?: string;
  noBorder?: boolean;
}) {
  return (
    <label
      className="flex items-center justify-between px-5 cursor-text"
      style={{ ...(noBorder ? {} : SEP), paddingTop: 15, paddingBottom: 15 }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: bold ? 700 : 400,
          color: "#FAFAF9",
          fontFamily: SF,
          flexShrink: 0,
          marginRight: 12,
        }}
      >
        {label}
      </span>
      {text !== undefined ? (
        <span
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            fontFamily: SF,
          }}
        >
          {text}
        </span>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={required ? "requis" : "Remplir"}
          className="bg-transparent border-none outline-none text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          style={{
            fontSize: 15,
            fontFamily: SF,
            width: 90,
            color: value ? "#FAFAF9" : "rgba(255,255,255,0.32)",
          }}
        />
      )}
    </label>
  );
}

export default function NutriInfoForm({
  editAliment,
  isForking,
  onEdited,
  onCreated,
  onBack,
  onClose,
}: Props) {
  const isEdit = !!editAliment?.id && !isForking;
  const [vals, setVals] = useState<Vals>({
    nom: editAliment?.nom ?? "",
    cal: editAliment?.calories?.toString() ?? "",
    prot: editAliment?.proteines?.toString() ?? "",
    gluc: editAliment?.glucides?.toString() ?? "",
    lip: editAliment?.lipides?.toString() ?? "",
    sucres: editAliment?.sucres?.toString() ?? "",
    fibres: editAliment?.fibres?.toString() ?? "",
    sel: editAliment?.sel?.toString() ?? "",
    portionNom: editAliment?.portion_nom ?? "",
    portionG: editAliment?.taille_portion_g?.toString() ?? "",
  });
  const [showMore, setShowMore] = useState(false);
  const [pending, startTransition] = useTransition();
  const set = (k: keyof Vals, v: string) => setVals((p) => ({ ...p, [k]: v }));
  const num = (v: string) => (v ? parseFloat(v) : null);

  const REQUIRED: (keyof Vals)[] = [
    "nom",
    "cal",
    "lip",
    "gluc",
    "sucres",
    "prot",
    "sel",
  ];
  const canSubmit = !pending && REQUIRED.every((k) => !!vals[k]);

  function handleSubmit() {
    if (!canSubmit) return;
    const cal = parseFloat(vals.cal);
    const p = {
      nom: vals.nom,
      cal,
      prot: num(vals.prot),
      gluc: num(vals.gluc),
      lip: num(vals.lip),
      sucres: num(vals.sucres),
      fibres: num(vals.fibres),
      sel: num(vals.sel),
      portionNom: vals.portionNom || null,
      portionG: num(vals.portionG),
    };
    startTransition(async () => {
      if (isEdit && editAliment) {
        await updateCustomAliment(
          editAliment.id,
          p.nom,
          p.cal,
          p.prot,
          p.gluc,
          p.lip,
          p.portionNom,
          p.portionG,
          editAliment.code_barres ?? null,
          p.fibres,
          p.sucres,
          p.sel,
        );
        onEdited?.({
          ...editAliment,
          nom: p.nom,
          calories: p.cal,
          proteines: p.prot,
          glucides: p.gluc,
          lipides: p.lip,
          fibres: p.fibres,
          sucres: p.sucres,
          sel: p.sel,
          portion_nom: p.portionNom,
          taille_portion_g: p.portionG,
        });
      } else {
        const { id } = await createCustomAliment(
          p.nom,
          p.cal,
          p.prot,
          p.gluc,
          p.lip,
          p.portionNom,
          p.portionG,
          null,
          p.fibres,
          p.sucres,
          p.sel,
        );
        onCreated?.({
          id,
          nom: p.nom,
          calories: p.cal,
          proteines: p.prot,
          glucides: p.gluc,
          lipides: p.lip,
          fibres: p.fibres,
          sucres: p.sucres,
          sel: p.sel,
          portion_nom: p.portionNom,
          taille_portion_g: p.portionG,
          is_global: false,
        });
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "#111927" }}
    >
      <div className="w-full h-full max-w-[430px] mx-auto flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 shrink-0"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: 6,
          }}
        >
          <button
            onClick={onBack}
            className="p-1 active:opacity-70 transition-opacity"
            aria-label="Retour"
          >
            <ChevronLeft size={26} style={{ color: "#0589D6" }} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ background: "rgba(255,255,255,0.15)" }}
            aria-label="Fermer"
          >
            <X size={15} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* Titre */}
        <div className="px-5 pb-5 shrink-0">
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#FAFAF9",
              fontFamily: SF,
            }}
          >
            Entrez les informations nutritionnelles
          </h1>
        </div>

        {/* Formulaire scrollable */}
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {/* Nom */}
          <label
            className="flex items-center justify-between px-5 cursor-text"
            style={{ ...SEP, paddingTop: 15, paddingBottom: 15 }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#FAFAF9",
                fontFamily: SF,
                flexShrink: 0,
                marginRight: 12,
              }}
            >
              Nom de l&apos;aliment
            </span>
            <input
              type="text"
              value={vals.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="requis"
              className="bg-transparent border-none outline-none text-right"
              style={{
                fontSize: 15,
                fontFamily: SF,
                width: 160,
                color: vals.nom ? "#FAFAF9" : "rgba(255,255,255,0.32)",
              }}
            />
          </label>

          <Row label="Valeurs pour" text="100 g" />
          <Row
            label="Énergie (kcal)"
            bold
            value={vals.cal}
            onChange={(v) => set("cal", v)}
            required
          />
          <Row
            label="Total des matières grasses (g)"
            bold
            value={vals.lip}
            onChange={(v) => set("lip", v)}
            required
          />

          {/* Tout afficher */}
          <button
            onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-2 px-5 active:opacity-70 transition-opacity w-full"
            style={{ ...SEP, paddingTop: 12, paddingBottom: 12 }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#0589D6" }}
            >
              <ChevronRight
                size={14}
                color="white"
                style={{
                  transform: showMore ? "rotate(90deg)" : "none",
                  transition: "transform 200ms",
                }}
              />
            </div>
            <span style={{ fontSize: 15, color: "#0589D6", fontFamily: SF }}>
              Tout afficher
            </span>
          </button>

          {showMore && (
            <>
              <Row
                label="Nom de la portion"
                value={vals.portionNom}
                onChange={(v) => set("portionNom", v)}
              />
              <Row
                label="Taille de la portion (g)"
                value={vals.portionG}
                onChange={(v) => set("portionG", v)}
              />
            </>
          )}

          <Row
            label="Glucides (g)"
            bold
            value={vals.gluc}
            onChange={(v) => set("gluc", v)}
            required
          />
          <Row
            label="Sucre (g)"
            value={vals.sucres}
            onChange={(v) => set("sucres", v)}
            required
          />
          <Row
            label="Fibres alimentaires (g)"
            value={vals.fibres}
            onChange={(v) => set("fibres", v)}
          />
          <Row
            label="Protéines (g)"
            bold
            value={vals.prot}
            onChange={(v) => set("prot", v)}
            required
          />
          <Row
            label="Sel (g)"
            bold
            value={vals.sel}
            onChange={(v) => set("sel", v)}
            required
            noBorder
          />

          {/* Section vitamines */}
          <div style={{ padding: "20px 20px 8px" }}>
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.38)",
                fontFamily: SF,
              }}
            >
              Vitamines (optionnel)
            </span>
          </div>
          <div
            className="flex items-center justify-between px-5"
            style={{ ...SEP, paddingTop: 15, paddingBottom: 15 }}
          >
            <span style={{ fontSize: 15, color: "#FAFAF9", fontFamily: SF }}>
              Vitamine C (mg)
            </span>
            <span
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.32)",
                fontFamily: SF,
              }}
            >
              Remplir
            </span>
          </div>
          <div
            className="flex items-center justify-between px-5"
            style={{ ...SEP, paddingTop: 15, paddingBottom: 15 }}
          >
            <span style={{ fontSize: 15, color: "#FAFAF9", fontFamily: SF }}>
              Vitamine D (µg)
            </span>
            <span
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.32)",
                fontFamily: SF,
              }}
            >
              Remplir
            </span>
          </div>

          <div style={{ height: 40 }} />
        </div>

        {/* Bouton Suivant */}
        <div
          className="shrink-0 px-5"
          style={{
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            paddingTop: 12,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-full text-[16px] font-semibold active:scale-[0.98] transition-all"
            style={{
              background: canSubmit ? "#0589D6" : "rgba(255,255,255,0.18)",
              color: canSubmit ? "white" : "rgba(255,255,255,0.4)",
              fontFamily: SF,
              transition: "background 250ms, color 250ms",
            }}
          >
            {pending ? "Enregistrement..." : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
