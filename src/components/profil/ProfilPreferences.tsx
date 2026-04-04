"use client";

import { useState, useTransition, useRef } from "react";
import { Sun, Moon, Check, Pipette, Sparkles } from "lucide-react";
import { updateTheme, updateAccentColors } from "@/app/actions/profil";
import { applyAccent, deriveSecondary } from "@/lib/apply-accent";
import type { ProfilData } from "@/lib/profil";

const PRESETS = [
  "#E8860C",
  "#22C55E",
  "#3B82F6",
  "#A855F7",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#F59E0B",
];

interface Props {
  profil: ProfilData;
}

export default function ProfilPreferences({ profil }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">(profil.theme);
  const [primary, setPrimary] = useState(profil.accent_color);
  const [secondary, setSecondary] = useState(profil.accent_secondary);
  const [autoSecondary, setAutoSecondary] = useState(!profil.accent_secondary);
  const [intensity, setIntensity] = useState(profil.gradient_intensity);
  const [isPending, startTransition] = useTransition();
  const pickerRef = useRef<HTMLInputElement>(null);
  const secPickerRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /** Applique immédiatement + persiste en DB (debounced) */
  function commitAll(p: string, s: string | null, g: number) {
    applyAccent(p, s, g);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await updateAccentColors(p, s, g);
        } catch (err) {
          console.error("[Profil] Erreur sauvegarde accent:", err);
        }
      });
    }, 400);
  }

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
      try {
        await updateTheme(next);
      } catch (err) {
        console.error("[Profil] Erreur sauvegarde thème:", err);
      }
    });
  }

  function selectPrimary(hex: string) {
    setPrimary(hex);
    commitAll(hex, autoSecondary ? null : secondary, intensity);
  }

  function selectSecondary(hex: string) {
    setSecondary(hex);
    setAutoSecondary(false);
    commitAll(primary, hex, intensity);
  }

  function toggleAutoSecondary() {
    const next = !autoSecondary;
    setAutoSecondary(next);
    const sec = next ? null : (secondary ?? deriveSecondary(primary));
    if (!next && !secondary) setSecondary(deriveSecondary(primary));
    commitAll(primary, sec, intensity);
  }

  function changeIntensity(val: number) {
    setIntensity(val);
    commitAll(primary, autoSecondary ? null : secondary, val);
  }

  const computedSecondary = autoSecondary
    ? deriveSecondary(primary)
    : (secondary ?? deriveSecondary(primary));

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

      <div
        className="my-4"
        style={{ height: 1, background: "var(--border)" }}
      />

      {/* Couleur principale */}
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Couleur principale
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {primary.toUpperCase()}
        </p>
        <div className="flex items-center gap-2.5 flex-wrap">
          {PRESETS.map((hex) => (
            <button
              key={hex}
              onClick={() => selectPrimary(hex)}
              disabled={isPending}
              className="relative rounded-full transition-transform active:scale-90 disabled:opacity-50"
              style={{
                width: 34,
                height: 34,
                background: hex,
                boxShadow:
                  primary === hex
                    ? `0 0 0 2px var(--bg-secondary), 0 0 0 4px ${hex}`
                    : "none",
              }}
              aria-label={hex}
            >
              {primary === hex && (
                <Check
                  size={14}
                  color="#fff"
                  className="absolute inset-0 m-auto"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
          <button
            onClick={() => pickerRef.current?.click()}
            disabled={isPending}
            className="relative rounded-full transition-transform active:scale-90 disabled:opacity-50 flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              background: PRESETS.includes(primary)
                ? "var(--bg-elevated)"
                : primary,
              border: PRESETS.includes(primary)
                ? "1.5px dashed var(--text-muted)"
                : `2px solid var(--bg-secondary)`,
              boxShadow: !PRESETS.includes(primary)
                ? `0 0 0 2px ${primary}`
                : "none",
            }}
            aria-label="Couleur personnalisée"
          >
            {PRESETS.includes(primary) ? (
              <Pipette size={14} style={{ color: "var(--text-muted)" }} />
            ) : (
              <Check size={14} color="#fff" strokeWidth={3} />
            )}
          </button>
          <input
            ref={pickerRef}
            type="color"
            value={primary}
            onChange={(e) => selectPrimary(e.target.value)}
            className="sr-only"
            aria-hidden
          />
        </div>
      </div>

      <div
        className="my-4"
        style={{ height: 1, background: "var(--border)" }}
      />

      {/* Couleur secondaire */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Couleur secondaire
          </p>
          <button
            onClick={toggleAutoSecondary}
            disabled={isPending}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors disabled:opacity-50"
            style={{
              background: autoSecondary
                ? "var(--accent-bg)"
                : "var(--bg-elevated)",
              color: autoSecondary ? "var(--accent-text)" : "var(--text-muted)",
              border: autoSecondary
                ? "1px solid color-mix(in srgb, var(--accent) 25%, transparent)"
                : "1px solid var(--border)",
            }}
          >
            <Sparkles size={10} />
            {autoSecondary ? "Auto" : "Manuel"}
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {autoSecondary
            ? "Dérivée automatiquement"
            : computedSecondary.toUpperCase()}
        </p>
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              background: computedSecondary,
              opacity: autoSecondary ? 0.8 : 1,
              transition: "background 0.3s ease",
            }}
          >
            <span className="text-white text-xs font-bold">Aa</span>
          </div>
          {!autoSecondary && (
            <>
              <button
                onClick={() => secPickerRef.current?.click()}
                disabled={isPending}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <Pipette size={14} />
                Choisir
              </button>
              <input
                ref={secPickerRef}
                type="color"
                value={computedSecondary}
                onChange={(e) => selectSecondary(e.target.value)}
                className="sr-only"
                aria-hidden
              />
            </>
          )}
          <div className="flex-1 flex items-center gap-1.5 justify-end">
            <div
              className="rounded-full"
              style={{ width: 18, height: 18, background: primary }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              +
            </span>
            <div
              className="rounded-full"
              style={{ width: 18, height: 18, background: computedSecondary }}
            />
          </div>
        </div>
      </div>

      <div
        className="my-4"
        style={{ height: 1, background: "var(--border)" }}
      />

      {/* Balance du dégradé */}
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Balance du dégradé
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {intensity}% primaire · {100 - intensity}% secondaire
        </p>

        {/* Indicateurs couleurs */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{ width: 12, height: 12, background: computedSecondary }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Secondaire
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Primaire
            </span>
            <div
              className="rounded-full"
              style={{ width: 12, height: 12, background: primary }}
            />
          </div>
        </div>

        {/* Slider avec fond dégradé secondaire → primaire */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={intensity}
          onChange={(e) => changeIntensity(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${computedSecondary}, ${primary})`,
            accentColor: primary,
          }}
        />

        {/* Aperçu gradient live */}
        <div
          className="mt-3 rounded-xl overflow-hidden"
          style={{ height: 40, background: "var(--grad-workout)" }}
        />
      </div>
    </section>
  );
}
