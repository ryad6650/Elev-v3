"use client";

import Link from "next/link";
import { Dumbbell, UtensilsCrossed, Scale } from "lucide-react";

const ACTIONS = [
  {
    icon: Dumbbell,
    label: "Séance",
    href: "/workout",
    color: "var(--accent)",
  },
  {
    icon: UtensilsCrossed,
    label: "Repas",
    href: "/nutrition",
    color: "var(--color-protein)",
  },
  {
    icon: Scale,
    label: "Poids",
    href: "/poids",
    color: "var(--success)",
  },
] as const;

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map(({ icon: Icon, label, href, color }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            transition: "transform 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
