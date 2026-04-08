"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DashboardData } from "@/lib/dashboard";
import CaloriesCard from "@/components/dashboard/CaloriesCard";
import MacrosCard from "@/components/dashboard/MacrosCard";
import WeeklyWorkoutCard from "@/components/dashboard/WeeklyWorkoutCard";
import SeancesWeekCard from "@/components/dashboard/SeancesWeekCard";
import SleepCard from "@/components/dashboard/SleepCard";

function formatDateFr(): string {
  return new Date()
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
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
      {/* Fond image + overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg-gym2.png')" }}
      />
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(12,8,4,0.35) 0%,
            rgba(12,8,4,0.55) 28%,
            rgba(12,8,4,0.80) 52%,
            rgba(12,8,4,0.95) 70%,
            rgba(12,8,4,1.00) 100%
          )`,
        }}
      />

      <main
        className="context-dark relative z-[2] flex flex-col min-h-dvh pb-24"
        style={{ maxWidth: 430, margin: "0 auto" }}
      >
        {/* Greeting */}
        <div className="px-[22px] pt-5 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[11px] font-medium tracking-[0.05em]"
              style={{ color: "#74BF7A", opacity: 0.8 }}
            >
              {formatDateFr()}
            </span>
            <Link
              href="/profil"
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #2d4a2f 0%, #1B2E1D 100%)",
                border: "1.5px solid rgba(116,191,122,0.3)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              {data.photoUrl ? (
                <Image
                  src={data.photoUrl}
                  alt="Profil"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-[13px] font-bold tracking-[0.02em]"
                  style={{ color: "#74BF7A" }}
                >
                  {prenom[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Link>
          </div>
          <p className="text-sm leading-none" style={{ color: "#d6d3d1" }}>
            Bonjour,
          </p>
          <h1
            className="leading-[1.02]"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              fontSize: 48,
              color: "#FAFAF9",
              letterSpacing: "-0.025em",
              textShadow: "0 2px 32px rgba(0,0,0,0.7)",
            }}
          >
            {prenom}.
          </h1>
        </div>

        {/* Contenu scrollable */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-3.5 flex flex-col gap-2.5"
          style={{ scrollbarWidth: "none" }}
        >
          <CaloriesCard
            consumed={data.caloriesConsommees}
            objective={data.objectifCalories}
          />

          <MacrosCard
            proteines={{
              consumed: data.proteinesConsommees,
              objective: data.objectifProteines,
            }}
            glucides={{
              consumed: data.glucidesConsommees,
              objective: data.objectifGlucides,
            }}
            lipides={{
              consumed: data.lipidesConsommees,
              objective: data.objectifLipides,
            }}
          />

          <WeeklyWorkoutCard
            seancesAujourdhui={data.seancesAujourdhui}
            seancesCetteSemaine={data.seancesCetteSemaine}
            prochaineRoutine={data.prochaineRoutine}
          />

          {/* Stats rapides */}
          <div className="flex gap-2.5">
            <SeancesWeekCard count={data.seancesCetteSemaine} />
            <SleepCard sommeilMinutes={data.sommeilMinutes} />
          </div>

          <div className="h-2 shrink-0" />
        </div>
      </main>
    </>
  );
}
