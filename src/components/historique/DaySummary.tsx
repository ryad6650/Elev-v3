"use client";

import type {
  HistoriqueWorkout,
  NutritionDaySummary,
  PoidsRecord,
  SommeilRecord,
  NutritionObjectifs,
} from "@/lib/historique";

interface Props {
  date: string;
  workouts: HistoriqueWorkout[];
  nutrition: NutritionDaySummary | undefined;
  poids: PoidsRecord | undefined;
  previousPoids: PoidsRecord | undefined;
  sommeil: SommeilRecord | undefined;
  avgSommeil: number;
  objectifs: NutritionObjectifs;
  onSelectWorkout: (id: string) => void;
}

const fmtDate = (s: string) => {
  const d = new Date(s + "T12:00:00");
  const isToday = s === new Date().toISOString().split("T")[0];
  const l = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const cap = l.charAt(0).toUpperCase() + l.slice(1);
  return isToday ? `${cap} — Aujourd'hui` : cap;
};

const fmtDuree = (m: number) => {
  const h = Math.floor(m / 60),
    r = m % 60;
  return h === 0
    ? `${r}min`
    : r === 0
      ? `${h}h`
      : `${h}h${String(r).padStart(2, "0")}`;
};

const fmtVol = (v: number) =>
  v >= 1000 ? new Intl.NumberFormat("fr-FR").format(v) : String(v);

export default function DaySummary({
  date,
  workouts,
  nutrition,
  poids,
  previousPoids,
  sommeil,
  avgSommeil,
  objectifs,
  onSelectWorkout,
}: Props) {
  const dayWorkouts = workouts.filter((w) => w.date === date);
  const hasData = dayWorkouts.length > 0 || nutrition || poids || sommeil;

  const calPct =
    nutrition && objectifs.calories > 0
      ? Math.min(
          Math.round((nutrition.calories / objectifs.calories) * 100),
          100,
        )
      : 0;

  const poidsDiff =
    poids && previousPoids
      ? Math.round((poids.poids - previousPoids.poids) * 10) / 10
      : null;

  const sommeilDiff =
    sommeil && avgSommeil > 0 ? sommeil.duree_minutes - avgSommeil : null;

  // Anneau SVG
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (calPct / 100) * circ;

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {fmtDate(date)}
        {dayWorkouts.length === 0 &&
          !sommeil &&
          !nutrition &&
          " — Aucune donnée"}
        {dayWorkouts.length === 0 &&
          (sommeil || nutrition) &&
          " — Jour de repos"}
      </div>

      {!hasData && (
        <div
          className="card-surface"
          style={{ padding: 20, textAlign: "center" }}
        >
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Rien de logué ce jour
          </p>
        </div>
      )}

      {hasData && (
        <div className="card-surface" style={{ padding: "14px 16px" }}>
          {/* Séances */}
          {dayWorkouts.length > 0
            ? dayWorkouts.map((w) => (
                <DayRow
                  key={w.id}
                  icon="💪"
                  onClick={() => onSelectWorkout(w.id)}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {w.routineNom ?? "Séance libre"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginTop: 1,
                    }}
                  >
                    {w.duree_minutes ? `${w.duree_minutes} min · ` : ""}
                    {w.exercises.length} exos · {fmtVol(w.volume)} kg
                  </div>
                </DayRow>
              ))
            : dayWorkouts.length === 0 &&
              (nutrition || sommeil) && (
                <DayRow icon="🛋️">
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Pas de séance
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Jour de repos — bonne récupération !
                  </div>
                </DayRow>
              )}

          {/* Nutrition */}
          {nutrition && (
            <DayRow
              icon="🥗"
              right={
                <div style={{ width: 40, height: 40, position: "relative" }}>
                  <svg
                    viewBox="0 0 40 40"
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: "rotate(-90deg)",
                    }}
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r={r}
                      fill="none"
                      strokeWidth={4}
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={r}
                      fill="none"
                      strokeWidth={4}
                      stroke="#74BF7A"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      style={{ transition: "stroke-dashoffset 700ms ease" }}
                    />
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {calPct}%
                  </span>
                </div>
              }
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Nutrition
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}
              >
                {new Intl.NumberFormat("fr-FR").format(nutrition.calories)} kcal
                {" · P "}
                {nutrition.proteines}g{" · G "}
                {nutrition.glucides}g{" · L "}
                {nutrition.lipides}g
              </div>
            </DayRow>
          )}

          {/* Poids */}
          {poids && (
            <DayRow icon="⚖️">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {poids.poids} kg
              </div>
              {poidsDiff !== null && poidsDiff !== 0 && (
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 1,
                    color: poidsDiff < 0 ? "#1E9D4C" : "var(--danger)",
                  }}
                >
                  {poidsDiff > 0 ? "↑" : "↓"} {Math.abs(poidsDiff)} kg vs
                  précédent
                </div>
              )}
            </DayRow>
          )}

          {/* Sommeil */}
          {sommeil && (
            <DayRow icon="😴" isLast>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {fmtDuree(sommeil.duree_minutes)} de sommeil
              </div>
              {sommeilDiff !== null && sommeilDiff !== 0 && (
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 1,
                    color:
                      sommeilDiff > 0
                        ? "var(--success)"
                        : "var(--text-secondary)",
                  }}
                >
                  {sommeilDiff > 0 ? "+" : ""}
                  {sommeilDiff} min vs moyenne
                </div>
              )}
            </DayRow>
          )}
        </div>
      )}
    </div>
  );
}

function DayRow({
  icon,
  children,
  right,
  onClick,
  isLast,
}: {
  icon: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  isLast?: boolean;
}) {
  return (
    <div
      className={
        onClick ? "cursor-pointer active:opacity-70 transition-opacity" : ""
      }
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span
        style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
