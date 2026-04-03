"use client";

import { useLayoutEffect } from "react";
import { applyAccent } from "@/lib/apply-accent";

interface Props {
  primary: string;
  secondary: string | null;
  balance: number;
  /** CSS pré-calculé côté serveur (déclarations custom properties) */
  ssrCSS: string;
  theme: "dark" | "light";
}

/**
 * Injecte les couleurs d'accent + restaure le thème :
 * - SSR : balise <style> pour zéro flash + script inline pour data-theme
 * - Client : useLayoutEffect pour le MutationObserver (toggle thème)
 */
export default function AccentInit({
  primary,
  secondary,
  balance,
  ssrCSS,
  theme,
}: Props) {
  useLayoutEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    applyAccent(primary, secondary, balance);
  }, [primary, secondary, balance, theme]);

  /* Script inline exécuté avant le paint pour éviter le flash */
  const themeScript =
    theme === "light"
      ? `document.documentElement.setAttribute("data-theme","light");`
      : "";

  return (
    <>
      {themeScript && (
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `:root{${ssrCSS}}` }} />
    </>
  );
}
