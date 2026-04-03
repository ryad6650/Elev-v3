"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Heart, Pencil } from "lucide-react";
import type { NutritionAliment } from "@/lib/nutrition-utils";
import QuantityScrollPicker from "./QuantityScrollPicker";
import FoodNutritionCard from "./FoodNutritionCard";

interface Props {
  aliment: NutritionAliment;
  mealLabel: string;
  onBack: () => void;
  onConfirm: (quantite: number) => void;
  onEdit?: () => void;
  pending?: boolean;
}

export default function FoodDetailSheet({
  aliment,
  mealLabel,
  onBack,
  onConfirm,
  onEdit,
  pending,
}: Props) {
  const portionG = aliment.taille_portion_g ?? 0;
  const hasPortion = portionG > 0;
  const [mode, setMode] = useState<"g" | "portion">(
    hasPortion ? "portion" : "g",
  );
  const [pickerVal, setPickerVal] = useState(hasPortion ? 1 : 100);
  const [fav, setFav] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [qtyInput, setQtyInput] = useState("");
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const qty = mode === "portion" ? pickerVal * portionG : pickerVal;
  const scale = qty / 100;
  const cal = Math.round(aliment.calories * scale);
  const prot = Math.round((aliment.proteines ?? 0) * scale * 10) / 10;
  const gluc = Math.round((aliment.glucides ?? 0) * scale * 10) / 10;
  const lip = Math.round((aliment.lipides ?? 0) * scale * 10) / 10;

  const pickerSuffix =
    mode === "portion" ? (aliment.portion_nom ?? "portion") : "g";
  const pickerMax = mode === "portion" ? 20 : 2000;
  const pickerStep = mode === "portion" ? 0.5 : 1;

  function switchMode(m: "g" | "portion") {
    setMode(m);
    setPickerVal(m === "portion" ? 1 : 100);
    setEditingQty(false);
  }

  function startEdit() {
    setEditingQty(true);
    setQtyInput(String(pickerVal));
  }

  function confirmEdit() {
    const n = parseFloat(qtyInput.replace(",", "."));
    if (!isNaN(n) && n > 0) {
      setPickerVal(
        Math.min(
          pickerMax,
          Math.max(pickerStep, Math.round(n / pickerStep) * pickerStep),
        ),
      );
    }
    setEditingQty(false);
  }

  return (
    <div
      className="flex flex-col"
      style={{
        maxHeight: "calc(100dvh - 165px - env(safe-area-inset-top, 20px))",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-4 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl"
          style={{ background: "var(--bg-elevated)" }}
        >
          <ChevronLeft size={17} style={{ color: "var(--text-primary)" }} />
        </button>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {mealLabel}
        </p>
        <div className="flex gap-1.5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-xl"
              style={{ background: "var(--bg-elevated)" }}
              title="Modifier l'aliment"
            >
              <Pencil size={15} style={{ color: "var(--accent-text)" }} />
            </button>
          )}
          <button
            onClick={() => setFav((f) => !f)}
            className="p-2 rounded-xl transition-colors"
            style={{
              background: fav ? "var(--accent-bg)" : "var(--bg-elevated)",
            }}
          >
            <Heart
              size={17}
              fill={fav ? "var(--accent)" : "none"}
              style={{ color: fav ? "var(--accent)" : "var(--text-muted)" }}
            />
          </button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-2"
        style={
          {
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties
        }
      >
        {/* Identité */}
        <div className="flex flex-col items-center pb-5 pt-1">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-3"
            style={{
              background: "var(--accent-bg)",
              color: "var(--accent-text)",
              border: "1px solid rgba(232,134,12,0.2)",
            }}
          >
            {aliment.nom.charAt(0).toUpperCase()}
          </div>
          <p
            className="text-center text-xl leading-snug"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            {aliment.nom}
          </p>
          {aliment.marque && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {aliment.marque}
            </p>
          )}
          {aliment.source === "openfoodfacts" && (
            <span
              className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{ background: "rgba(59,130,246,0.15)", color: "#93C5FD" }}
            >
              OpenFoodFacts
            </span>
          )}
        </div>

        <FoodNutritionCard
          aliment={aliment}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((d) => !d)}
          onEdit={onEdit}
          hasPortion={hasPortion}
        />
      </div>

      {/* Bottom — picker + CTA */}
      <div
        className="shrink-0 px-4 pb-4 pt-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p
          className="text-center text-xs font-semibold mb-3"
          style={{ color: "var(--accent-text)" }}
        >
          ≈ {cal} kcal · P {prot}g · G {gluc}g · L {lip}g
        </p>

        <div className="flex gap-3 mb-4">
          <div className="shrink-0 relative" style={{ width: "55%" }}>
            <QuantityScrollPicker
              value={pickerVal}
              onChange={setPickerVal}
              min={pickerStep}
              max={pickerMax}
              step={pickerStep}
              suffix={pickerSuffix}
              compact
              onCenterTap={startEdit}
              editing={editingQty}
              editValue={qtyInput}
              onEditChange={setQtyInput}
              onEditConfirm={confirmEdit}
              inputRef={qtyInputRef}
            />
          </div>

          <div
            className="flex-1 rounded-2xl flex flex-col justify-center items-center gap-2 px-2 py-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {mode === "portion" && (
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                = {qty}g
              </p>
            )}
            <div className="flex flex-col w-full gap-1.5">
              <button
                onClick={() => switchMode("g")}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${mode === "g" ? "btn-accent" : ""}`}
                style={
                  mode === "g"
                    ? undefined
                    : {
                        background: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                Grammes
              </button>
              <button
                onClick={() => hasPortion && switchMode("portion")}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${mode === "portion" ? "btn-accent" : ""}`}
                style={{
                  ...(mode === "portion"
                    ? {}
                    : {
                        background: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }),
                  opacity: hasPortion ? 1 : 0.4,
                  cursor: hasPortion ? "pointer" : "default",
                }}
              >
                {hasPortion
                  ? (aliment.portion_nom ?? "Portion")
                  : "Pas de portion"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onConfirm(qty)}
          disabled={pending}
          className="btn-accent w-full py-4 rounded-2xl font-bold text-sm transition-opacity"
          style={{
            opacity: pending ? 0.6 : 1,
            boxShadow: "0 4px 20px rgba(232,134,12,0.3)",
          }}
        >
          {pending ? "Ajout..." : `Ajouter au ${mealLabel}`}
        </button>
      </div>
    </div>
  );
}
