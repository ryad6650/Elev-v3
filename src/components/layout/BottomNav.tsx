"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";

const navItems = [
  { href: "/workout", label: "Séances", emoji: "💪" },
  { href: "/poids", label: "Poids", emoji: "⚖️" },
  { href: "/dashboard", label: "Accueil", emoji: "🏠" },
  { href: "/nutrition", label: "Nutrition", emoji: "🥗" },
  { href: "/historique", label: "Historique", emoji: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = useUiStore((s) => s.fullscreenModal);

  if (hidden) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <nav
        className="pointer-events-auto flex items-center justify-around"
        style={{
          width: "calc(100% - 32px)",
          maxWidth: 398,
          background: "#1B1715",
          borderRadius: 40,
          padding: "8px 6px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {navItems.map(({ href, label, emoji }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="flex flex-col items-center justify-center active:scale-95 transition-all"
              aria-label={label}
              style={{
                padding: active ? "6px 16px" : "6px 12px",
                borderRadius: 24,
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  opacity: active ? 1 : 0.45,
                }}
              >
                {emoji}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  marginTop: 2,
                  color: active ? "#fff" : "var(--text-muted)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
