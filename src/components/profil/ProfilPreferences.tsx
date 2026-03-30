"use client";

import { useState, useTransition } from "react";
import { Sun, Moon } from "lucide-react";
import { updateTheme } from "@/app/actions/profil";
import type { ProfilData } from "@/lib/profil";

interface Props {
  profil: ProfilData;
}

export default function ProfilPreferences({ profil }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">(profil.theme);
  const [isPending, startTransition] = useTransition();

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    // Applique le thème immédiatement côté client
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    startTransition(async () => {
      await updateTheme(next);
    });
  }

  return (
    <section
      className="rounded-2xl p-5 mb-4"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Préférences
      </h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Thème
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {theme === "dark" ? "Sombre" : "Clair"}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          disabled={isPending}
          className="relative w-14 h-7 rounded-full transition-colors duration-200 flex items-center disabled:opacity-50"
          style={{
            background: theme === "light" ? "var(--accent)" : "var(--bg-elevated)",
          }}
          aria-label="Basculer le thème"
        >
          <span
            className="absolute w-5 h-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center"
            style={{
              transform: theme === "light" ? "translateX(30px)" : "translateX(4px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {theme === "light" ? (
              <Sun size={11} style={{ color: "var(--accent)" }} />
            ) : (
              <Moon size={11} style={{ color: "var(--text-muted)" }} />
            )}
          </span>
        </button>
      </div>
    </section>
  );
}
