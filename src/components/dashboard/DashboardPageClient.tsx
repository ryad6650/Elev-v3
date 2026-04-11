"use client";

import type { DashboardData } from "@/lib/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSummaryRow from "@/components/dashboard/DashboardSummaryRow";
import DashboardNutritionCard from "@/components/dashboard/DashboardNutritionCard";
import DashboardWeekCard from "@/components/dashboard/DashboardWeekCard";
import DashboardNextRoutine from "@/components/dashboard/DashboardNextRoutine";

interface Props {
  initialData: DashboardData;
}

export default function DashboardPageClient({ initialData }: Props) {
  const d = initialData;

  return (
    <main
      className="relative flex flex-col min-h-dvh"
      style={{
        maxWidth: 430,
        margin: "0 auto",
        background: "#1B1715",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
      }}
    >
      <div className="flex flex-col gap-5" style={{ padding: "24px 24px 0" }}>
        <DashboardHeader
          prenom={d.prenom ?? "toi"}
          seancesCetteSemaine={d.seancesCetteSemaine}
          photoUrl={d.photoUrl}
        />

        <DashboardSummaryRow
          calories={d.caloriesConsommees}
          objectifCalories={d.objectifCalories}
          poids={d.poidsActuel}
          sommeilMinutes={d.sommeilMinutes}
        />

        {/* Nutrition */}
        <div>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 10 }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Nutrition
            </div>
            <a
              href="/nutrition"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#74BF7A",
                textDecoration: "none",
              }}
            >
              Voir tout →
            </a>
          </div>
          <DashboardNutritionCard
            calories={d.caloriesConsommees}
            objectif={d.objectifCalories}
            glucides={d.glucidesConsommees}
            proteines={d.proteinesConsommees}
            lipides={d.lipidesConsommees}
            objectifGlucides={d.objectifGlucides}
            objectifProteines={d.objectifProteines}
            objectifLipides={d.objectifLipides}
          />
        </div>

        <DashboardWeekCard streakJours={d.streakJours} />

        <DashboardNextRoutine routine={d.prochaineRoutine} />
      </div>
    </main>
  );
}
