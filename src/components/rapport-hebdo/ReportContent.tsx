"use client";

import type { WeeklyReportData, WeeklyWorkout } from "@/lib/weekly-report";

interface Props {
  data: WeeklyReportData;
}

function formatDayLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}` : `${m} min`;
}

function formatSommeil(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
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

function WorkoutCard({ workout }: { workout: WeeklyWorkout }) {
  return (
    <div
      className="p-4 rounded-2xl border space-y-3"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {formatDayLabel(workout.date)}
          </p>
          {workout.routine_nom && (
            <p
              className="text-sm font-semibold mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {workout.routine_nom}
            </p>
          )}
        </div>
        {workout.duree_minutes != null && (
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            {formatDuree(workout.duree_minutes)}
          </span>
        )}
      </div>

      {workout.exercises.map((ex, i) => (
        <div key={i}>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--accent-text)" }}
          >
            {ex.nom}
            <span style={{ color: "var(--text-muted)" }}>
              {" "}
              · {ex.groupe_musculaire}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ex.sets.map((s, j) => (
              <span
                key={j}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                }}
              >
                {s.poids ?? 0}kg × {s.reps ?? 0}
              </span>
            ))}
          </div>
        </div>
      ))}

      {workout.exercises.length === 0 && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Aucun exercice enregistré
        </p>
      )}
    </div>
  );
}

function MacroBar({
  label,
  value,
  objectif,
  color,
}: {
  label: string;
  value: number;
  objectif: number;
  color: string;
}) {
  const pct = objectif > 0 ? Math.min((value / objectif) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] w-6 shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg-card)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-[10px] w-12 text-right"
        style={{ color: "var(--text-secondary)" }}
      >
        {value}g
      </span>
    </div>
  );
}

export default function ReportContent({ data }: Props) {
  // Moyennes nutrition
  const nbJoursNutrition = data.nutrition.length;
  const avgCal =
    nbJoursNutrition > 0
      ? Math.round(
          data.nutrition.reduce((s, d) => s + d.calories, 0) / nbJoursNutrition,
        )
      : 0;
  const avgProt =
    nbJoursNutrition > 0
      ? Math.round(
          data.nutrition.reduce((s, d) => s + d.proteines, 0) /
            nbJoursNutrition,
        )
      : 0;
  const avgGluc =
    nbJoursNutrition > 0
      ? Math.round(
          data.nutrition.reduce((s, d) => s + d.glucides, 0) / nbJoursNutrition,
        )
      : 0;
  const avgLip =
    nbJoursNutrition > 0
      ? Math.round(
          data.nutrition.reduce((s, d) => s + d.lipides, 0) / nbJoursNutrition,
        )
      : 0;

  // Moyenne sommeil
  const nbJoursSommeil = data.sleep.length;
  const avgSommeil =
    nbJoursSommeil > 0
      ? Math.round(
          data.sleep.reduce((s, d) => s + d.duree_minutes, 0) / nbJoursSommeil,
        )
      : 0;

  return (
    <div
      className="space-y-2 p-4 rounded-2xl"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Résumé rapide */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="flex flex-col items-center p-3 rounded-xl border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-xl">💪</span>
          <span
            className="text-lg font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-lora)",
              fontStyle: "italic",
            }}
          >
            {data.workouts.length}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            séance{data.workouts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div
          className="flex flex-col items-center p-3 rounded-xl border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-xl">🔥</span>
          <span
            className="text-lg font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-lora)",
              fontStyle: "italic",
            }}
          >
            {avgCal}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            kcal/jour moy.
          </span>
        </div>
        <div
          className="flex flex-col items-center p-3 rounded-xl border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-xl">😴</span>
          <span
            className="text-lg font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-lora)",
              fontStyle: "italic",
            }}
          >
            {avgSommeil > 0 ? formatSommeil(avgSommeil) : "—"}
          </span>
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            sommeil moy.
          </span>
        </div>
      </div>

      {/* Séances */}
      <SectionLabel label="Entraînements" />
      {data.workouts.length === 0 ? (
        <p
          className="text-xs text-center py-4"
          style={{ color: "var(--text-muted)" }}
        >
          Aucune séance cette semaine
        </p>
      ) : (
        <div className="space-y-3">
          {data.workouts.map((w, i) => (
            <WorkoutCard key={i} workout={w} />
          ))}
        </div>
      )}

      {/* Nutrition */}
      <SectionLabel label="Nutrition" />
      {nbJoursNutrition === 0 ? (
        <p
          className="text-xs text-center py-4"
          style={{ color: "var(--text-muted)" }}
        >
          Aucune donnée nutrition
        </p>
      ) : (
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Moyenne journalière ({nbJoursNutrition} jour
            {nbJoursNutrition !== 1 ? "s" : ""} tracké
            {nbJoursNutrition !== 1 ? "s" : ""})
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-lora)",
                fontStyle: "italic",
                color: "var(--text-primary)",
              }}
            >
              {avgCal}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              / {data.objectifs.calories} kcal
            </span>
          </div>
          <div className="space-y-2">
            <MacroBar
              label="P"
              value={avgProt}
              objectif={data.objectifs.proteines}
              color="var(--color-protein)"
            />
            <MacroBar
              label="G"
              value={avgGluc}
              objectif={data.objectifs.glucides}
              color="var(--color-carbs)"
            />
            <MacroBar
              label="L"
              value={avgLip}
              objectif={data.objectifs.lipides}
              color="var(--color-fat)"
            />
          </div>

          {/* Détail par jour */}
          <div className="space-y-1.5 mt-2">
            {data.nutrition.map((d) => (
              <div
                key={d.date}
                className="flex items-center justify-between text-[11px]"
              >
                <span style={{ color: "var(--text-muted)" }}>
                  {formatDayLabel(d.date)}
                </span>
                <div className="flex gap-3">
                  <span style={{ color: "var(--text-primary)" }}>
                    {d.calories} kcal
                  </span>
                  <span style={{ color: "var(--color-protein)" }}>
                    {d.proteines}g P
                  </span>
                  <span style={{ color: "var(--color-carbs)" }}>
                    {d.glucides}g G
                  </span>
                  <span style={{ color: "var(--color-fat)" }}>
                    {d.lipides}g L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sommeil */}
      <SectionLabel label="Sommeil" />
      {nbJoursSommeil === 0 ? (
        <p
          className="text-xs text-center py-4"
          style={{ color: "var(--text-muted)" }}
        >
          Aucune donnée sommeil
        </p>
      ) : (
        <div
          className="p-4 rounded-2xl border space-y-2"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Durée par nuit
          </p>
          {data.sleep.map((s) => (
            <div
              key={s.date}
              className="flex items-center justify-between text-[11px]"
            >
              <span style={{ color: "var(--text-muted)" }}>
                {formatDayLabel(s.date)}
              </span>
              <span
                className="font-semibold"
                style={{
                  color:
                    s.duree_minutes >= 420
                      ? "var(--success)"
                      : "var(--text-primary)",
                }}
              >
                {formatSommeil(s.duree_minutes)}
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between text-xs pt-2 mt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span
              className="font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Moyenne
            </span>
            <span className="font-bold" style={{ color: "var(--accent-text)" }}>
              {formatSommeil(avgSommeil)}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <p
        className="text-center text-[9px] pt-4"
        style={{ color: "var(--text-muted)" }}
      >
        Élev — Rapport généré automatiquement
      </p>
    </div>
  );
}
