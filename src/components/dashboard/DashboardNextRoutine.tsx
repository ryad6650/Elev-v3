"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { ProchaineRoutine } from "@/lib/dashboard";

interface Props {
  routine: ProchaineRoutine | null;
}

export default function DashboardNextRoutine({ routine }: Props) {
  if (!routine) return null;

  const dureeLabel = routine.dureeEstimee
    ? `${routine.nbExercices} exercices · ~${routine.dureeEstimee} min`
    : `${routine.nbExercices} exercices`;

  return (
    <div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: 14,
        }}
      >
        Prochaine seance
      </div>

      <Link
        href="/workout"
        className="flex items-center gap-4 active:scale-[0.98] transition-transform"
        style={{
          background: "#1C1C1E",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 18,
          textDecoration: "none",
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #001429, var(--accent))",
          }}
        >
          <span style={{ fontSize: 26 }}>🏋️</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {routine.nom}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 3,
            }}
          >
            {dureeLabel}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={22} color="var(--text-muted)" />
      </Link>

      {/* CTA */}
      <Link
        href="/workout"
        className="flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        style={{
          width: "100%",
          marginTop: 16,
          padding: 20,
          borderRadius: 20,
          background:
            "linear-gradient(135deg, #001429 0%, #024a7a 40%, #0589d6 100%)",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        <Play size={18} fill="#fff" stroke="#fff" />
        Demarrer la seance
      </Link>
    </div>
  );
}
