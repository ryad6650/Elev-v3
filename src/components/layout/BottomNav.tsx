"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";

const navItems = [
  {
    href: "/workout",
    label: "Séances",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
        fill="none"
        strokeWidth={1.8}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/poids",
    label: "Poids",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
        fill="none"
        strokeWidth={1.8}
      >
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Accueil",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
        fill="none"
        strokeWidth={1.8}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/nutrition",
    label: "Nutrition",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
        fill="none"
        strokeWidth={1.8}
      >
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    href: "/historique",
    label: "Historique",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={26}
        height={26}
        fill="none"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = useUiStore((s) => s.fullscreenModal);

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center justify-around w-full"
        style={{
          maxWidth: 430,
          borderTop: "1px solid rgba(0,0,0,0.05)",
          background: "rgba(243,240,234,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "14px 32px 0",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="flex flex-col items-center gap-[5px]"
              aria-label={label}
              style={{
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                stroke: active ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {icon}
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
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
