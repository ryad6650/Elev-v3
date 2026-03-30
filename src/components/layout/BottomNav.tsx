"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Scale, LayoutDashboard, Utensils, History } from "lucide-react";

const navItems = [
  { href: "/workout", icon: Dumbbell, label: "Séance" },
  { href: "/poids", icon: Scale, label: "Poids" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/nutrition", icon: Utensils, label: "Nutrition" },
  { href: "/profil", icon: History, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(12, 10, 9, 0.85)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-[25px] transition-all"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--text-muted)",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
