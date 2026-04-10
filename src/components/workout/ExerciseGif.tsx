"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell } from "lucide-react";

interface Props {
  gifUrl: string | null;
  nom: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Charger en priorité (au-dessus du fold) */
  priority?: boolean;
  circle?: boolean;
}

const SIZES = {
  sm: { container: "w-10 h-10", icon: 14, radius: "rounded-lg", px: 40 },
  md: { container: "w-14 h-14", icon: 18, radius: "rounded-xl", px: 56 },
  lg: { container: "w-24 h-24", icon: 28, radius: "rounded-2xl", px: 96 },
};

export default function ExerciseGif({
  gifUrl,
  nom,
  size = "md",
  className = "",
  priority = false,
  circle = false,
}: Props) {
  const [error, setError] = useState(false);
  const s = SIZES[size];
  const radius = circle ? "rounded-full" : s.radius;

  if (!gifUrl || error) {
    return (
      <div
        className={`${s.container} ${radius} flex items-center justify-center shrink-0 ${className}`}
        style={{ background: "var(--bg-elevated)" }}
      >
        <Dumbbell size={s.icon} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  // Les GIFs animés ne bénéficient pas de l'optimisation Next.js
  const isGif = gifUrl.endsWith(".gif");

  return (
    <div
      className={`${s.container} ${radius} overflow-hidden shrink-0 relative ${className}`}
      style={{ background: "var(--bg-elevated)" }}
    >
      <Image
        src={gifUrl}
        alt={nom}
        fill
        sizes={`${s.px}px`}
        className="object-cover"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        unoptimized={isGif}
        onError={() => setError(true)}
      />
    </div>
  );
}
