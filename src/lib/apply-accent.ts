import type { AccentColor } from "@/lib/profil";

/** Applique la couleur d'accent sur le document */
export function applyAccent(color: AccentColor) {
  if (color === "orange") {
    document.documentElement.removeAttribute("data-accent");
  } else {
    document.documentElement.setAttribute("data-accent", color);
  }
}
