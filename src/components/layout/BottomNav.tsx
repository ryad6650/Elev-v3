"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";

const navItems = [
  { href: "/workout", icon: "/icons/nav-seances.png", label: "Séances" },
  { href: "/poids", icon: "/icons/nav-poids.png", label: "Poids" },
  { href: "/dashboard", icon: "/icons/nav-accueil.png", label: "Accueil" },
  { href: "/nutrition", icon: "/icons/nav-nutrition.png", label: "Nutrition" },
  {
    href: "/historique",
    icon: "/icons/nav-historique.png",
    label: "Historique",
  },
];

const CREAM_PAGES = new Set([
  "/dashboard",
  "/workout",
  "/poids",
  "/nutrition",
  "/historique",
]);

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = useUiStore((s) => s.fullscreenModal);

  if (hidden) return null;

  const isCream = CREAM_PAGES.has(pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center justify-around w-full py-3 px-8"
        style={{
          maxWidth: 430,
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="flex items-center justify-center"
              style={{ width: 24, height: 24 }}
              aria-label={label}
            >
              <Image
                src={icon}
                alt={label}
                width={22}
                height={22}
                className="object-contain"
                style={{
                  opacity: active ? 1 : 0.5,
                  filter:
                    !isCream && !active
                      ? "invert(1) brightness(0.6)"
                      : !isCream && active
                        ? "invert(1)"
                        : undefined,
                }}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
