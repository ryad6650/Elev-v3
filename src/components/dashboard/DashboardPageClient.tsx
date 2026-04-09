"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DashboardData } from "@/lib/dashboard";
import CaloriesCard from "@/components/dashboard/CaloriesCard";
import WeekDots from "@/components/dashboard/WeekDots";
import SleepStat from "@/components/dashboard/SleepStat";

function formatDateFr(): string {
  return new Date()
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
}

interface Props {
  initialData: DashboardData;
}

export default function DashboardPageClient({ initialData }: Props) {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);

  const data = initialData;
  const prenom = data.prenom ?? "toi";

  return (
    <main
      className="relative flex flex-col min-h-dvh pb-24"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <div className="flex flex-col" style={{ padding: "20px 28px 0" }}>
        {/* Header row — date + avatar */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 32 }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                marginBottom: 6,
              }}
            >
              {formatDateFr()}
            </div>
            <div
              style={{
                fontFamily: "var(--font-lora), serif",
                fontStyle: "italic",
                fontSize: 38,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
              }}
            >
              Bonjour, {prenom}
            </div>
          </div>

          <Link
            href="/profil"
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "var(--green-dim)",
            }}
          >
            {data.photoUrl ? (
              <Image
                src={data.photoUrl}
                alt="Profil"
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--green)",
                }}
              >
                {prenom[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </Link>
        </div>

        {/* Calories card */}
        <div style={{ marginBottom: 16 }}>
          <CaloriesCard
            consumed={data.caloriesConsommees}
            objective={data.objectifCalories}
            glucides={data.glucidesConsommees}
            proteines={data.proteinesConsommees}
            lipides={data.lipidesConsommees}
            objectifGlucides={data.objectifGlucides}
            objectifProteines={data.objectifProteines}
            objectifLipides={data.objectifLipides}
          />
        </div>

        {/* Week streak */}
        <div style={{ marginBottom: 16 }}>
          <WeekDots />
        </div>

        {/* Stats row — poids + sommeil */}
        <div className="flex gap-3" style={{ marginBottom: 16 }}>
          <button
            className="flex-1 text-center active:opacity-70 transition-opacity"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "var(--glass-blur)",
              WebkitBackdropFilter: "var(--glass-blur)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--glass-border)",
              padding: 20,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚖️</div>
            <div
              style={{
                fontFamily: "var(--font-lora), serif",
                fontStyle: "italic",
                fontSize: 28,
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {data.poidsActuel ?? "—"}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: 6,
              }}
            >
              kg
            </div>
          </button>

          <SleepStat sommeilMinutes={data.sommeilMinutes} />
        </div>

        {/* CTA — Demarrer une seance */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/workout"
            className="flex items-center justify-center gap-2.5 active:opacity-85 transition-opacity"
            style={{
              width: "100%",
              padding: "18px 32px",
              borderRadius: "var(--radius-pill)",
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--cta-text)"
              strokeWidth={2.5}
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Démarrer une séance
          </Link>
        </div>
      </div>
    </main>
  );
}
