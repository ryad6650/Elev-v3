"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 page-enter" style={{ background: "var(--bg-primary)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Email envoyé
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Si un compte existe pour <strong>{email}</strong>, tu recevras un lien de réinitialisation.
          </p>
          <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 page-enter" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "var(--text-primary)" }}>
          Élev
        </h1>
        <p className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Mot de passe oublié
        </p>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          Entre ton email pour recevoir un lien de réinitialisation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="ton@email.com"
              className="w-full rounded-[10px] px-4 py-3 text-sm outline-none"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.12)", color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          <Link href="/login" className="hover:underline" style={{ color: "var(--accent-text)" }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
