"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";
import CaloriesRing from "@/components/dashboard/CaloriesRing";
import MacrosBars from "@/components/dashboard/MacrosBars";
import SleepMiniStat from "@/components/dashboard/SleepMiniStat";
import ThemeToggleButton from "@/components/dashboard/ThemeToggleButton";
import MondayReportCard from "@/components/dashboard/MondayReportCard";

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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span
        className="text-[10px] font-semibold uppercase tracking-widest shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

function MiniStat({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-2xl border gap-1 card-surface"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <span
        className="text-lg font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] text-center"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface Props {
  initialData: DashboardData;
}

export default function DashboardPageClient({ initialData }: Props) {
  const data = initialData;
  const prenom = data.prenom ?? "toi";

  return (
    <main
      className="px-4 pt-5 pb-4 space-y-4 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tete */}
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDateFr()}
        </p>
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-xs mb-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Bonjour,
            </p>
            <h1
              className="leading-tight"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                fontSize: 38,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {prenom}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ThemeToggleButton initialTheme={data.theme} />
            <Link
              href="/profil"
              className="flex items-center justify-center rounded-[13px] overflow-hidden shrink-0"
              style={{
                width: 46,
                height: 46,
                background: data.photoUrl ? "transparent" : "var(--bg-card)",
                border:
                  "1px solid color-mix(in srgb, var(--accent-secondary) 35%, transparent)",
              }}
            >
              {data.photoUrl ? (
                <Image
                  src={data.photoUrl}
                  alt="Profil"
                  width={46}
                  height={46}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  {prenom[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--accent-bg)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              color: "var(--accent-text)",
            }}
          >
            ⚡ Jour {data.streakConnexions}
          </span>
          {data.poidsActuel != null && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              ⚖️ {data.poidsActuel} kg
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            💪 {data.seancesCetteSemaine} séance
            {data.seancesCetteSemaine !== 1 ? "s" : ""} cette sem.
          </span>
        </div>

        <div
          className="mt-4 rounded-full"
          style={{
            height: 2.5,
            background: "var(--grad-header-line)",
          }}
        />
      </div>

      <MondayReportCard />

      <SectionDivider label="Calories" />

      <div
        className="p-5 rounded-2xl border card-surface"
        style={{ borderColor: "var(--border)" }}
      >
        <CaloriesRing
          consumed={data.caloriesConsommees}
          objective={data.objectifCalories}
        />
      </div>

      <SectionDivider label="Macronutriments" />

      <div
        className="p-5 rounded-2xl border card-surface"
        style={{ borderColor: "var(--border)" }}
      >
        <MacrosBars
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
      </div>

      <SectionDivider label="Entraînement" />

      {data.prochaineRoutine && (
        <Link href="/workout" className="block">
          <div className="workout-next-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-60"
                style={{ color: "#fff" }}
              >
                Prochain entraînement
              </p>
              <h2
                className="text-2xl leading-tight text-white mb-1"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                }}
              >
                {data.prochaineRoutine.nom}
              </h2>
              <p className="text-xs opacity-70" style={{ color: "#fff" }}>
                {data.prochaineRoutine.nbExercices} exercice
                {data.prochaineRoutine.nbExercices !== 1 ? "s" : ""}
                {data.prochaineRoutine.dureeEstimee != null &&
                  ` · ~${data.prochaineRoutine.dureeEstimee} min`}
                {data.prochaineRoutine.groupesMusculaires.length > 0 &&
                  ` · ${data.prochaineRoutine.groupesMusculaires.join(" + ")}`}
              </p>
            </div>
            <div
              className="flex items-center justify-center rounded-full shrink-0 ml-4"
              style={{
                width: 38,
                height: 38,
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <ArrowRight size={18} color="#fff" />
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          emoji="💪"
          value={String(data.seancesCetteSemaine)}
          label="Séances / sem"
        />
        <SleepMiniStat initialMinutes={data.sommeilMinutes} />
      </div>
    </main>
  );
}
