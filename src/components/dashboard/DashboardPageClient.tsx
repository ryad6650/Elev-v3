"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData, type DashboardData } from "@/lib/dashboard";
import { getCached, setCache } from "@/lib/pageCache";
import CaloriesRing from "@/components/dashboard/CaloriesRing";
import MacrosBars from "@/components/dashboard/MacrosBars";
import SleepMiniStat from "@/components/dashboard/SleepMiniStat";
import ThemeToggleButton from "@/components/dashboard/ThemeToggleButton";

const CACHE_KEY = "dashboard";

function formatDateFr(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).replace(/^\w/, (c) => c.toUpperCase());
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

function MiniStat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl border gap-1" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const prenom = data.prenom ?? "toi";

  return (
    <main className="px-4 pt-5 pb-4 space-y-4 page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>

      {/* En-tete */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          {formatDateFr()}
        </p>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Bonjour,</p>
            <h1
              className="leading-tight"
              style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", fontSize: 38, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              {prenom}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ThemeToggleButton initialTheme={data.theme} />
            <Link
              href="/profil"
              className="flex items-center justify-center rounded-[13px] overflow-hidden shrink-0"
              style={{ width: 46, height: 46, background: data.photoUrl ? "transparent" : "var(--bg-card)", border: "1px solid rgba(232,134,12,0.28)" }}
            >
              {data.photoUrl ? (
                <Image src={data.photoUrl} alt="Profil" width={46} height={46} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{prenom[0]?.toUpperCase() ?? "?"}</span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(232,134,12,0.12)", border: "1px solid rgba(232,134,12,0.25)", color: "var(--accent-text)" }}>
            ⚡ Jour {data.streakConnexions}
          </span>
          {data.poidsActuel != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              ⚖️ {data.poidsActuel} kg
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            💪 {data.seancesCetteSemaine} séance{data.seancesCetteSemaine !== 1 ? "s" : ""} cette sem.
          </span>
        </div>

        <div className="mt-4 rounded-full" style={{ height: 2.5, background: "linear-gradient(to right, #C8622E, #E8860C, transparent)" }} />
      </div>

      <SectionDivider label="Calories" />

      <div className="p-5 rounded-2xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <CaloriesRing consumed={data.caloriesConsommees} objective={data.objectifCalories} />
      </div>

      <SectionDivider label="Macronutriments" />

      <div className="p-5 rounded-2xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <MacrosBars
          proteines={{ consumed: data.proteinesConsommees, objective: data.objectifProteines }}
          glucides={{ consumed: data.glucidesConsommees, objective: data.objectifGlucides }}
          lipides={{ consumed: data.lipidesConsommees, objective: data.objectifLipides }}
        />
      </div>

      <SectionDivider label="Entraînement" />

      {data.prochaineRoutine && (
        <Link href="/workout" className="block">
          <div className="workout-next-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-60" style={{ color: "#fff" }}>Prochain entraînement</p>
              <h2 className="text-2xl leading-tight text-white mb-1" style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}>
                {data.prochaineRoutine.nom}
              </h2>
              <p className="text-xs opacity-70" style={{ color: "#fff" }}>
                {data.prochaineRoutine.nbExercices} exercice{data.prochaineRoutine.nbExercices !== 1 ? "s" : ""}
                {data.prochaineRoutine.dureeEstimee != null && ` · ~${data.prochaineRoutine.dureeEstimee} min`}
                {data.prochaineRoutine.groupesMusculaires.length > 0 && ` · ${data.prochaineRoutine.groupesMusculaires.join(" + ")}`}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-full shrink-0 ml-4" style={{ width: 38, height: 38, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
              <ArrowRight size={18} color="#fff" />
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3">
        <MiniStat emoji="💧" value="—" label="Hydratation" />
        <MiniStat emoji="💪" value={String(data.seancesCetteSemaine)} label="Séances / sem" />
        <SleepMiniStat initialMinutes={data.sommeilMinutes} />
      </div>

    </main>
  );
}

export default function DashboardPageClient() {
  const [data, setData] = useState<DashboardData | null>(getCached<DashboardData>(CACHE_KEY));

  useEffect(() => {
    const supabase = createClient();
    fetchDashboardData(supabase).then((d) => {
      setData(d);
      setCache(CACHE_KEY, d);
    }).catch(console.error);
  }, []);

  if (!data) return (
    <main className="px-4 pt-5 pb-4 space-y-4" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="flex items-center justify-center" style={{ height: "50vh" }}>
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    </main>
  );

  return <DashboardContent data={data} />;
}
