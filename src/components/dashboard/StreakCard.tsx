interface WeeklyBarProps {
  fait: number;
  total: number;
  color: string;
}

function WeeklyBar({ fait, total, color }: WeeklyBarProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{ background: i < fait ? color : "var(--bg-elevated)" }}
        />
      ))}
    </div>
  );
}

interface Props {
  streak: number;
  seances: { fait: number; objectif: number };
  nutrition: { jours: number };
  poids: { jours: number };
}

export default function StreakCard({ streak, seances, nutrition, poids }: Props) {
  const objectifHebdoAtteint =
    seances.fait >= seances.objectif &&
    nutrition.jours >= 5 &&
    poids.jours >= 5;

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Streak */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{streak > 0 ? "🔥" : "💤"}</span>
        <div>
          <p className="text-2xl font-bold leading-none" style={{ color: "var(--accent-text)" }}>
            {streak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {streak === 1 ? "jour consécutif" : "jours consécutifs"}
          </p>
        </div>
        {objectifHebdoAtteint && (
          <span className="ml-auto text-xl" title="Objectif hebdo atteint !">
            🏆
          </span>
        )}
      </div>

      {/* Objectifs hebdomadaires */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              💪 Séances
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {seances.fait} / {seances.objectif}
            </span>
          </div>
          <WeeklyBar fait={seances.fait} total={seances.objectif} color="var(--accent)" />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              🥗 Nutrition
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {nutrition.jours} / 7j
            </span>
          </div>
          <WeeklyBar fait={nutrition.jours} total={7} color="var(--color-carbs)" />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              ⚖️ Poids
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {poids.jours} / 7j
            </span>
          </div>
          <WeeklyBar fait={poids.jours} total={7} color="var(--color-protein)" />
        </div>
      </div>
    </div>
  );
}
