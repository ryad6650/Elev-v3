"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateInfosProfil } from "@/app/actions/profil";
import { toast } from "@/store/toastStore";
import type { ProfilData } from "@/lib/profil";

interface Props {
  profil: ProfilData;
}

export default function ProfilInfosForm({ profil }: Props) {
  const [prenom, setPrenom] = useState(profil.prenom ?? "");
  const [taille, setTaille] = useState(profil.taille?.toString() ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateInfosProfil({
          prenom: prenom.trim(),
          taille: taille ? parseFloat(taille) : null,
        });
        setSuccess(true);
        toast.success("Profil mis à jour");
        setTimeout(() => setSuccess(false), 2000);
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
        Mes informations
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label
            className="block text-sm mb-1.5 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Prénom
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm mb-1.5 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Taille (cm)
          </label>
          <input
            type="number"
            value={taille}
            onChange={(e) => setTaille(e.target.value)}
            placeholder="ex. 175"
            min={100}
            max={250}
            style={inputStyle}
          />
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
