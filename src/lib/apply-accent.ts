/**
 * Application côté client des couleurs d'accent sur le DOM.
 * Réutilise les calculs purs de accent-compute.ts.
 */

import { computeAccentCSS, deriveSecondary } from "@/lib/accent-compute";

export { deriveSecondary } from "@/lib/accent-compute";

// ─── State interne pour le MutationObserver ────────────────

let lastPrimary = "#E8860C";
let lastSecondary: string | null = null;
let lastBalance = 50;
let observerActive = false;

function apply(primary: string, secondary: string | null, balance: number) {
  const doc = document.documentElement;
  const isDark = !doc.hasAttribute("data-theme");
  doc.removeAttribute("data-accent");

  const css = computeAccentCSS({ primary, secondary, balance, isDark });
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    doc.style.setProperty(decl.slice(0, idx), decl.slice(idx + 1));
  }
}

function watchTheme() {
  if (observerActive) return;
  observerActive = true;
  new MutationObserver((muts) => {
    if (muts.some((m) => m.attributeName === "data-theme")) {
      requestAnimationFrame(() =>
        apply(lastPrimary, lastSecondary, lastBalance),
      );
    }
  }).observe(document.documentElement, { attributes: true });
}

/** Point d'entrée unique — appeler à chaque changement de couleur/balance */
export function applyAccent(
  primary: string,
  secondary: string | null,
  balance = 50,
) {
  lastPrimary = primary;
  lastSecondary = secondary;
  lastBalance = balance;
  apply(primary, secondary, balance);
  watchTheme();
}
