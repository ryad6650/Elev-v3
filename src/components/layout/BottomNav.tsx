"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/programmes", emoji: "📋", label: "Programmes" },
  { href: "/workout", emoji: "💪", label: "Séance" },
  { href: "/dashboard", emoji: "🏠", label: "Accueil" },
  { href: "/nutrition", emoji: "🥗", label: "Nutrition" },
  { href: "/poids", emoji: "⚖️", label: "Poids" },
  { href: "/historique", emoji: "📊", label: "Historique" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center px-2 py-2 gap-0.5"
        style={{
          background: "color-mix(in srgb, var(--bg-secondary) 90%, transparent)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border)",
          borderRadius: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          width: "min(96vw, 460px)",
        }}
      >
        {navItems.map(({ href, emoji, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 items-center justify-center py-3 rounded-[22px] transition-colors"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--text-muted)",
              }}
            >
              <span className="text-[22px] leading-none">{emoji}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
