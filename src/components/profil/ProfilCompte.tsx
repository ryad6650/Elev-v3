"use client";

import { useState, useTransition } from "react";
import { LogOut, KeyRound, Check, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/app/actions/profil";
import { createClient } from "@/lib/supabase/client";

export default function ProfilCompte() {
  const router = useRouter();
  const [showPwForm, setShowPwForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 8) { setPwError("Minimum 8 caractères"); return; }
    if (newPw !== confirmPw) { setPwError("Les mots de passe ne correspondent pas"); return; }
    startTransition(async () => {
      const result = await updatePassword(currentPw, newPw);
      if (result.error) {
        setPwError(result.error);
      } else {
        setPwSuccess(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => { setPwSuccess(false); setShowPwForm(false); }, 2000);
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
      className="rounded-2xl mb-4 overflow-hidden"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase px-5 pt-5 pb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Compte
      </h2>

      {/* Modifier le mot de passe */}
      <button
        onClick={() => setShowPwForm(!showPwForm)}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-colors"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <KeyRound size={18} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Modifier le mot de passe
          </span>
        </div>
        <ChevronRight
          size={16}
          style={{
            color: "var(--text-muted)",
            transform: showPwForm ? "rotate(90deg)" : "none",
            transition: "transform 200ms",
          }}
        />
      </button>

      {showPwForm && (
        <form onSubmit={handlePasswordSubmit} className="px-5 pb-4 flex flex-col gap-3">
          {[
            { label: "Mot de passe actuel", value: currentPw, setter: setCurrentPw },
            { label: "Nouveau mot de passe", value: newPw, setter: setNewPw },
            { label: "Confirmer le nouveau", value: confirmPw, setter: setConfirmPw },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          ))}
          {pwError && <p className="text-sm" style={{ color: "var(--danger)" }}>{pwError}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: pwSuccess ? "var(--success)" : "var(--accent)", color: "#fff" }}
          >
            {pwSuccess ? <><Check size={16} /> Modifié</> : isPending ? "Vérification…" : "Changer le mot de passe"}
          </button>
        </form>
      )}

      {/* Déconnexion */}
      {!showLogoutConfirm ? (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <LogOut size={18} style={{ color: "var(--danger)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--danger)" }}>
            Se déconnecter
          </span>
        </button>
      ) : (
        <div
          className="px-5 py-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Confirmer la déconnexion ?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--danger)", color: "#fff" }}
            >
              Déconnecter
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
