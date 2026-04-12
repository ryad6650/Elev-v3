"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Check, ImagePlus } from "lucide-react";
import { createExercise } from "@/app/actions/exercises";

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: (ex: Exercise) => void;
}

const GROUPES = [
  "Pectoraux",
  "Dos",
  "Épaules",
  "Biceps",
  "Triceps",
  "Abdominaux",
  "Quadriceps",
  "Ischio-jambiers",
  "Fessiers",
  "Mollets",
  "Avant-bras",
];

const EQUIPEMENTS = [
  "Barre",
  "Haltères",
  "Machine",
  "Poulie / Câble",
  "Poids du corps",
  "Corde",
  "Kettlebell",
  "Smith machine",
  "Bande élastique",
];

export default function CreateExerciseModal({ onClose, onCreated }: Props) {
  const [nom, setNom] = useState("");
  const [groupe, setGroupe] = useState("");
  const [equipement, setEquipement] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = nom.trim().length >= 2 && groupe !== "";

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      let gifUrl: string | null = null;

      // Upload image si sélectionnée
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("/api/exercises/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur upload image");
        gifUrl = data.url;
      }

      const ex = await createExercise({
        nom: nom.trim(),
        groupe_musculaire: groupe,
        equipement: equipement || null,
        gif_url: gifUrl,
      });
      setLoading(false);
      onCreated(ex);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-2xl px-4 pt-5 pb-8 space-y-5 max-h-[85dvh] overflow-y-auto"
        style={{ background: "linear-gradient(to bottom, #e8e6e2, #f3f0ea)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Nouvel exercice
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.5)" }}
            aria-label="Fermer"
          >
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Image */}
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Image{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              (optionnel)
            </span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImagePick}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden">
              <Image
                src={imagePreview}
                alt="Aperçu"
                fill
                className="object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}
                aria-label="Supprimer l'image"
              >
                <X size={12} color="white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "2px dashed rgba(0,0,0,0.06)",
              }}
            >
              <ImagePlus size={20} style={{ color: "var(--text-muted)" }} />
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                Ajouter
              </span>
            </button>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Nom de l&apos;exercice *
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Ex : Curl incliné haltères"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Groupe musculaire */}
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Groupe musculaire *
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUPES.map((g) => (
              <button
                key={g}
                onClick={() => setGroupe(g === groupe ? "" : g)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background:
                    groupe === g ? "#1E9D4C" : "rgba(255,255,255,0.5)",
                  color: groupe === g ? "white" : "var(--text-secondary)",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Équipement */}
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Équipement{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              (optionnel)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPEMENTS.map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipement(eq === equipement ? "" : eq)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background:
                    equipement === eq ? "#1E9D4C" : "rgba(255,255,255,0.5)",
                  color: equipement === eq ? "white" : "var(--text-secondary)",
                }}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs" style={{ color: "#c94444" }}>
            {error}
          </p>
        )}

        {/* Bouton valider */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background:
              canSubmit && !loading ? "#1E9D4C" : "rgba(255,255,255,0.5)",
            color: canSubmit && !loading ? "white" : "var(--text-muted)",
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? (
            "Création..."
          ) : (
            <>
              <Check size={16} />
              Créer l&apos;exercice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
