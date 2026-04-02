"use client";

import { useState, useTransition } from "react";
import { Sun, Moon, Check } from "lucide-react";
import { updateTheme, updateAccentColor } from "@/app/actions/profil";
import { applyAccent } from "@/lib/apply-accent";
import type { ProfilData } from "@/lib/profil";
import type { AccentColor } from "@/lib/profil";

const ACCENT_OPTIONS: { value: AccentColor; color: string; label: string }[] = [
  { value: "orange", color: "#E8860C", label: "Orange" },
  { value: "green", color: "#22c55e", label: "Vert" },
  { value: "blue", color: "#3b82f6", label: "Bleu" },
  { value: "purple", color: "#a855f7", label: "Violet" },
  { value: "red", color: "#ef4444", label: "Rouge" },
  { value: "cyan", color: "#06b6d4", label: "Cyan" },
  { value: "silver", color: "#a8a29e", label: "Argent" },
];

interface Props {
  profil: ProfilData;
}

export default function ProfilPreferences({ profil }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">(profil.theme);
  const [accent, setAccent] = useState<AccentColor>(profil.accent_color);
  const [isPending, startTransition] = useTransition();

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    document.documentElement.classList.add("theme-transitioning");
    setTimeout(
      () => document.documentElement.classList.remove("theme-transitioning"),
      350,
    );

    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    startTransition(async () => {
      await updateTheme(next);
    });
  }

  function selectAccent(color: AccentColor) {
    setAccent(color);
    applyAccent(color);
    startTransition(async () => {
      await updateAccentColor(color);
    });
  }

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
        Préférences
      </h2>

      {/* Thème dark/light */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
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
            background:
              theme === "light" ? "var(--accent)" : "var(--bg-elevated)",
          }}
          aria-label="Basculer le thème"
        >
          <span
            className="absolute w-5 h-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center"
            style={{
              transform:
                theme === "light" ? "translateX(30px)" : "translateX(4px)",
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

      {/* Séparateur */}
      <div
        className="my-4"
        style={{ height: 1, background: "var(--border)" }}
      />

      {/* Couleur d'accent */}
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Couleur d&apos;accent
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {ACCENT_OPTIONS.find((o) => o.value === accent)?.label ?? "Orange"}
        </p>
        <div className="flex gap-3">
          {ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectAccent(opt.value)}
              disabled={isPending}
              className="relative rounded-full transition-transform active:scale-90 disabled:opacity-50"
              style={{
                width: 36,
                height: 36,
                background: opt.color,
                boxShadow:
                  accent === opt.value
                    ? `0 0 0 2px var(--bg-secondary), 0 0 0 4px ${opt.color}`
                    : "none",
              }}
              aria-label={opt.label}
            >
              {accent === opt.value && (
                <Check
                  size={16}
                  color="#fff"
                  className="absolute inset-0 m-auto"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
