"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadPhotoProfil } from "@/app/actions/profil";
import type { ProfilData } from "@/lib/profil";

interface Props {
  profil: ProfilData;
}

function formatMemberSince(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function ProfilHeader({ profil }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(profil.photo_url);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initiale = profil.prenom
    ? profil.prenom[0].toUpperCase()
    : "?";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation immédiate
    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
    setUploadError(null);

    const formData = new FormData();
    formData.append("photo", file);

    startTransition(async () => {
      try {
        const url = await uploadPhotoProfil(formData);
        setPhotoUrl(url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Erreur upload");
        setPhotoUrl(profil.photo_url); // rollback
      } finally {
        URL.revokeObjectURL(objectUrl);
        // Reset input pour permettre de re-sélectionner le même fichier
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar cliquable */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative shrink-0 group"
        aria-label="Modifier la photo de profil"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {initiale}
          </div>
        )}

        {/* Overlay upload */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
          style={{ background: "rgba(0,0,0,0.45)", opacity: isPending ? 1 : 0 }}
          aria-hidden
        >
          {isPending
            ? <Loader2 size={20} color="#fff" className="animate-spin" />
            : <Camera size={18} color="#fff" />
          }
        </div>

        {/* Indicateur hover */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.4)" }}
          aria-hidden
        >
          <Camera size={18} color="#fff" />
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="min-w-0">
        <h1
          className="text-2xl leading-tight truncate"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          {profil.prenom || "Mon profil"}
        </h1>
        {profil.created_at && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Membre depuis {formatMemberSince(profil.created_at)}
          </p>
        )}
        {uploadError && (
          <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{uploadError}</p>
        )}
      </div>
    </div>
  );
}
