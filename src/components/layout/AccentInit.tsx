"use client";

import { useLayoutEffect } from "react";
import { applyAccent } from "@/lib/apply-accent";

interface Props {
  primary: string;
  secondary: string | null;
  balance: number;
  /** CSS pré-calculé côté serveur (déclarations custom properties) */
  ssrCSS: string;
}

/**
 * Injecte les couleurs d'accent :
 * - SSR : balise <style> pour zéro flash
 * - Client : useLayoutEffect pour le MutationObserver (toggle thème)
 */
export default function AccentInit({
  primary,
  secondary,
  balance,
  ssrCSS,
}: Props) {
  useLayoutEffect(() => {
    applyAccent(primary, secondary, balance);
  }, [primary, secondary, balance]);

  return <style dangerouslySetInnerHTML={{ __html: `:root{${ssrCSS}}` }} />;
}
