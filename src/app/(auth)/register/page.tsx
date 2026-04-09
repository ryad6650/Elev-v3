"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Cet email est déjà utilisé"
          : error.message,
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch {
      setGoogleLoading(false);
      setError("Erreur lors de la connexion Google");
    }
  }

  if (success) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-4 page-enter"
        style={{ background: "var(--bg-gradient)" }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Vérifie ta boîte mail
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            On t&apos;a envoyé un lien de confirmation à{" "}
            <strong>{email}</strong>. Clique dessus pour activer ton compte.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold"
            style={{ color: "var(--accent-text)" }}
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 page-enter"
      style={{ background: "var(--bg-gradient)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <h1
          className="text-3xl mb-1"
          style={{
            fontFamily: "var(--font-lora)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Élev
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          Crée ton compte
        </p>

        {/* Bouton Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <GoogleIcon />
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1"
            style={{ height: 1, background: "var(--border)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            ou
          </span>
          <div
            className="flex-1"
            style={{ height: 1, background: "var(--border)" }}
          />
        </div>

        {/* Formulaire email/MDP */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="ton@email.com"
              className="w-full rounded-[10px] px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              className="w-full rounded-[10px] px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-[10px] px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm rounded-xl px-4 py-3"
              style={{
                background: "var(--danger-bg)",
                color: "var(--danger)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p
          className="mt-6 text-sm text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="hover:underline"
            style={{ color: "var(--accent-text)" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
