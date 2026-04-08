"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";

const navItems = [
  { href: "/workout", emoji: "💪", label: "Séances" },
  { href: "/poids", emoji: "⚖️", label: "Poids" },
  { href: "/dashboard", emoji: "🏠", label: "Accueil" },
  { href: "/nutrition", emoji: "🥗", label: "Nutrition" },
  { href: "/historique", emoji: "📊", label: "Historique" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = useUiStore((s) => s.fullscreenModal);

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none h-[72px]">
      <nav
        className="pointer-events-auto flex items-center px-2 py-2 gap-0.5 h-[56px]"
        style={{
          background: "rgba(20,14,8,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          width: "min(96vw, 460px)",
        }}
      >
        {navItems.map(({ href, emoji, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="flex flex-1 items-center justify-center transition-colors"
            >
              <div
                className="flex items-center justify-center px-3.5 py-2 rounded-[20px]"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                }}
              >
                <span className="text-lg leading-none">{emoji}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
