import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchDashboardData, type DashboardData } from "@/lib/dashboard";
import CaloriesRing from "@/components/dashboard/CaloriesRing";
import MacrosBars from "@/components/dashboard/MacrosBars";

export default async function DashboardPage() {
  let data: DashboardData;

  try {
    data = await fetchDashboardData();
  } catch {
    return <DashboardEmpty />;
  }

  const prenom = data.prenom ?? "toi";

  return (
    <main className="px-4 pt-6 pb-4 space-y-4 page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Bonjour,</p>
          <h1
            className="text-4xl leading-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            {prenom}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2 mt-1">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ border: "1.5px solid var(--accent)", color: "var(--accent)" }}
            >
              ✦ PREMIUM
            </button>
            <Link
              href="/profil"
              className="flex items-center justify-center rounded-full overflow-hidden transition-all shrink-0"
              style={{
                width: 40,
                height: 40,
                background: data.photoUrl ? "transparent" : "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {data.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  {data.prenom ? data.prenom[0].toUpperCase() : "?"}
                </span>
              )}
            </Link>
          </div>
          {data.streakJours > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              🔥 {data.streakJours} jours
            </div>
          )}
        </div>
      </div>

      {/* Carte Calories */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <CaloriesRing consumed={data.caloriesConsommees} objective={data.objectifCalories} />
      </div>

      {/* Carte Macronutriments */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Macronutriments
        </p>
        <MacrosBars
          proteines={{ consumed: data.proteinesConsommees, objective: data.objectifProteines }}
          glucides={{ consumed: data.glucidesConsommees, objective: data.objectifGlucides }}
          lipides={{ consumed: data.lipidesConsommees, objective: data.objectifLipides }}
        />
      </div>

      {/* Prochain entraînement */}
      {data.prochaineRoutine && (
        <Link href="/workout" className="block">
          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: "linear-gradient(to right, #C8622E, #E8860C)" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80" style={{ color: "#fff" }}>
                Prochain entraînement
              </p>
              <h2
                className="text-2xl leading-tight text-white mb-1"
                style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}
              >
                {data.prochaineRoutine.nom}
              </h2>
              <p className="text-sm opacity-80" style={{ color: "#fff" }}>
                {data.prochaineRoutine.nbExercices} exercice{data.prochaineRoutine.nbExercices !== 1 ? "s" : ""}
                {data.prochaineRoutine.dureeEstimee != null && ` · ~${data.prochaineRoutine.dureeEstimee} min`}
                {data.prochaineRoutine.groupesMusculaires.length > 0 && ` · ${data.prochaineRoutine.groupesMusculaires.join(" + ")}`}
              </p>
            </div>
            <div
              className="flex items-center justify-center rounded-full shrink-0 ml-4"
              style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)" }}
            >
              <ArrowRight size={20} color="#fff" />
            </div>
          </div>
        </Link>
      )}

      {/* Mini-stats */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat emoji="💧" value="—" label="Hydratation" />
        <MiniStat emoji="💪" value={String(data.seancesCetteSemaine)} label="Séances / sem" />
        <MiniStat emoji="😴" value="—" label="Sommeil" />
      </div>

    </main>
  );
}

function MiniStat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-2xl border gap-1"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function DashboardEmpty() {
  return (
    <main className="px-4 pt-6 pb-4 page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>
      <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Bonjour,</p>
      <h1
        className="text-4xl leading-tight mb-2"
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontStyle: "italic",
          color: "var(--text-primary)",
        }}
      >
        Bienvenue
      </h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Connecte-toi pour voir tes stats.
      </p>
    </main>
  );
}
