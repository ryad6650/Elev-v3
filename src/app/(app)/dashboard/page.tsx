import { fetchDashboardData, type DashboardData } from "@/lib/dashboard";
import CaloriesRing from "@/components/dashboard/CaloriesRing";
import MacrosBars from "@/components/dashboard/MacrosBars";
import QuickActions from "@/components/dashboard/QuickActions";
import StreakCard from "@/components/dashboard/StreakCard";
import InsightCard from "@/components/dashboard/InsightCard";
import WeightMiniChart from "@/components/dashboard/WeightMiniChart";

// Salutation selon l'heure
function getGreeting(prenom: string | null): string {
  const hour = new Date().getHours();
  const name = prenom ?? "toi";
  if (hour < 12) return `Bonjour, ${name}`;
  if (hour < 18) return `Bon après-midi, ${name}`;
  return `Bonne soirée, ${name}`;
}

// Formatage date française
function formatDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

// Insight passif calculé depuis les données
function buildInsight(data: DashboardData): string {
  if (data.streakJours >= 7) {
    return `${data.streakJours} jours d'activité consécutifs — tu es en feu ! Garde ce rythme. 🔥`;
  }
  if (data.seancesAujourdhui) {
    return "Séance du jour validée 💪 Pense à bien t'hydrater et récupérer.";
  }
  if (data.poidsDelta !== null && data.poidsDelta < -0.3) {
    return `Tu as perdu ${Math.abs(data.poidsDelta)} kg cette semaine. Belle progression ! 🎯`;
  }
  if (data.poidsDelta !== null && data.poidsDelta > 0.5) {
    return `+${data.poidsDelta} kg cette semaine — si tu cherches à perdre du poids, revois peut-être tes calories.`;
  }
  if (data.caloriesConsommees === 0) {
    return "Commence à logger tes repas pour suivre tes calories et macros au quotidien.";
  }
  const restantes = data.objectifCalories - data.caloriesConsommees;
  if (restantes < 200 && restantes > 0) {
    return `Il ne te reste que ${restantes} kcal aujourd'hui — fais attention au dîner !`;
  }
  return "Continue sur cette lancée ! Chaque jour logué compte pour tes progrès.";
}

export default async function DashboardPage() {
  let data: DashboardData;

  try {
    data = await fetchDashboardData();
  } catch {
    return <DashboardEmpty />;
  }

  const greeting = getGreeting(data.prenom);
  const dateStr = formatDate();
  const insight = buildInsight(data);

  return (
    <main className="px-4 pt-6 pb-4 space-y-4 page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* En-tête */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
          {dateStr}
        </p>
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          {greeting}
        </h1>
      </div>

      {/* Calories + Macros */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Calories du jour
        </p>
        <div className="flex items-center gap-5">
          <CaloriesRing
            consumed={data.caloriesConsommees}
            objective={data.objectifCalories}
          />
          <div className="flex-1 min-w-0">
            <MacrosBars
              proteines={{ consumed: data.proteinesConsommees, objective: data.objectifProteines }}
              glucides={{ consumed: data.glucidesConsommees, objective: data.objectifGlucides }}
              lipides={{ consumed: data.lipidesConsommees, objective: data.objectifLipides }}
            />
            {data.poidsActuel && (
              <div className="mt-3 pt-3 border-t flex items-baseline gap-2" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Poids actuel</span>
                <span className="text-sm font-bold" style={{ color: "var(--accent-text)" }}>
                  {data.poidsActuel} kg
                </span>
                {data.poidsDelta !== null && (
                  <span
                    className="text-xs"
                    style={{ color: data.poidsDelta > 0 ? "var(--danger)" : "var(--success)" }}
                  >
                    {data.poidsDelta > 0 ? "+" : ""}{data.poidsDelta} kg / sem
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Actions rapides
        </p>
        <QuickActions />
      </div>

      {/* Streak + objectifs hebdo */}
      <StreakCard
        streak={data.streakJours}
        seances={{ fait: data.seancesCetteSemaine, objectif: 4 }}
        nutrition={{ jours: data.nutritionJoursCetteSemaine }}
        poids={{ jours: data.poidsJoursCetteSemaine }}
      />

      {/* Insight IA passif */}
      <InsightCard message={insight} />

      {/* Graphique poids 30 jours */}
      {data.weightHistory.length >= 2 && (
        <div
          className="p-5 rounded-2xl border"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <WeightMiniChart data={data.weightHistory} />
        </div>
      )}
    </main>
  );
}

function DashboardEmpty() {
  return (
    <main className="px-4 pt-6 pb-4 page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
        {formatDate()}
      </p>
      <h1
        className="text-3xl leading-tight mb-2"
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontStyle: "italic",
          color: "var(--text-primary)",
        }}
      >
        Bienvenue sur Élev
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Commence ta première séance ou log ton premier repas pour voir tes stats ici.
      </p>
      <QuickActions />
    </main>
  );
}
