"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Check, ImagePlus } from "lucide-react";
import { updateExercise } from "@/app/actions/exercises";
import ExerciseGif from "./ExerciseGif";

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url: string | null;
}

interface Props {
  exercise: Exercise;
  onClose: () => void;
  onUpdated: (ex: Exercise) => void;
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

function PillSelect({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item === value ? "" : item)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: value === item ? "var(--accent)" : "var(--bg-elevated)",
            color: value === item ? "white" : "var(--text-secondary)",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default function EditExerciseModal({
  exercise,
  onClose,
  onUpdated,
}: Props) {
  const [nom, setNom] = useState(exercise.nom);
  const [groupe, setGroupe] = useState(exercise.groupe_musculaire);
  const [equipement, setEquipement] = useState(exercise.equipement ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const currentImage = removeImg ? null : (imagePreview ?? exercise.gif_url);
  const canSubmit = nom.trim().length >= 2 && groupe !== "";

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImg(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      let gifUrl: string | null | undefined = undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const res = await fetch("/api/exercises/upload-image", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur upload");
        gifUrl = data.url;
      } else if (removeImg) {
        gifUrl = null;
      }
      const ex = await updateExercise(exercise.id, {
        nom: nom.trim(),
        groupe_musculaire: groupe,
        equipement: equipement || null,
        gif_url: gifUrl,
      });
      onUpdated(ex);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-2xl px-4 pt-5 pb-8 space-y-5 max-h-[85dvh] overflow-y-auto"
        style={{ background: "var(--bg-secondary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-lg"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            Modifier l&apos;exercice
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: "var(--bg-elevated)" }}
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
            Image <span style={{ fontWeight: 400 }}>(optionnel)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImagePick}
            className="hidden"
          />
          {currentImage ? (
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={imagePreview}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <ExerciseGif
                  gifUrl={exercise.gif_url}
                  nom={exercise.nom}
                  size="lg"
                />
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Changer
                </button>
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setRemoveImg(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ color: "var(--danger)" }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95"
              style={{
                background: "var(--bg-elevated)",
                border: "2px dashed var(--border)",
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
            Nom *
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Ex : Curl incliné haltères"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Groupe musculaire *
          </label>
          <PillSelect items={GROUPES} value={groupe} onChange={setGroupe} />
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Équipement <span style={{ fontWeight: 400 }}>(optionnel)</span>
          </label>
          <PillSelect
            items={EQUIPEMENTS}
            value={equipement}
            onChange={setEquipement}
          />
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background:
              canSubmit && !loading ? "var(--accent)" : "var(--bg-elevated)",
            color: canSubmit && !loading ? "white" : "var(--text-muted)",
          }}
        >
          {loading ? (
            "Enregistrement..."
          ) : (
            <>
              <Check size={16} /> Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
