"use client";

import { useState, useTransition } from "react";
import { Sun, Moon } from "lucide-react";
import { updateTheme } from "@/app/actions/profil";

interface Props {
  initialTheme: "dark" | "light";
}

export default function ThemeToggleButton({ initialTheme }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">(initialTheme);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    // Activer les transitions CSS uniquement pendant le changement de thème
    document.documentElement.classList.add("theme-transitioning");
    setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 350);

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
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label="Basculer le thème"
      className="flex items-center justify-center rounded-[13px] shrink-0 transition-colors disabled:opacity-50"
      style={{
        width: 46,
        height: 46,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {theme === "dark" ? (
        <Moon size={18} style={{ color: "var(--text-secondary)" }} />
      ) : (
        <Sun size={18} style={{ color: "var(--text-secondary)" }} />
      )}
    </button>
  );
}
