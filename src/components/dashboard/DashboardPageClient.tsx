"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DashboardData } from "@/lib/dashboard";
import CaloriesCard from "@/components/dashboard/CaloriesCard";
import WeekDots from "@/components/dashboard/WeekDots";
import SleepStat from "@/components/dashboard/SleepStat";

const C = {
  text: "#4A3728",
  muted: "#78716C",
  secondary: "#A8A29E",
  avatarBg: "#e8dcc8",
  avatarBorder: "rgba(74,55,40,0.1)",
  bg: "var(--bg-gradient)",
} as const;

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
    <>
      <main
        className="relative flex flex-col min-h-dvh pb-24"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        <div className="px-6 pt-4 flex flex-col">
          {/* Date + Profil — même ligne */}
          <div
            className="flex items-start justify-between"
            style={{ marginBottom: 16 }}
          >
            <p
              className="uppercase"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: C.muted,
              }}
            >
              {formatDateFr()}
            </p>
            <Link
              href="/profil"
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 36,
                height: 36,
                background: C.avatarBg,
                border: `1px solid ${C.avatarBorder}`,
              }}
            >
              {data.photoUrl ? (
                <Image
                  src={data.photoUrl}
                  alt="Profil"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    fontStyle: "italic",
                    fontSize: 16,
                    color: C.text,
                  }}
                >
                  {prenom[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Link>
          </div>

          {/* Greeting */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                fontSize: 38,
                lineHeight: 1.15,
                color: C.text,
                letterSpacing: "-0.01em",
              }}
            >
              Bonjour,
              <br />
              {prenom}
            </h1>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 10 }}>
              Prêt pour une belle journée ?
            </p>
          </div>

          <div style={{ marginTop: 28 }}>
            <CaloriesCard
              consumed={data.caloriesConsommees}
              objective={data.objectifCalories}
            />
          </div>

          <WeekDots />

          {/* Stats inline */}
          <div className="mt-8 flex flex-col gap-4">
            <SleepStat sommeilMinutes={data.sommeilMinutes} />
            <div className="flex items-baseline gap-2.5">
              <span style={{ fontSize: 18 }}>💪</span>
              <span
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: 22,
                  color: C.text,
                }}
              >
                {data.seancesCetteSemaine}
              </span>
              <span style={{ fontSize: 15, color: C.muted }}>
                séance{data.seancesCetteSemaine !== 1 ? "s" : ""} ce mois-ci
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
