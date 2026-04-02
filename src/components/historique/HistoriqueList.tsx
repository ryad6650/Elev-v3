import { useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const dateLabel = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  if (dateStr === today) return `Aujourd'hui · ${dateLabel}`;
  if (dateStr === yesterday) return `Hier · ${dateLabel}`;
  return dateLabel;
}

function formatVolume(v: number): string {
  return v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v);
}

function getGroupLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  if (date >= monday) return "Cette semaine";
  if (date >= lastMonday) return "Semaine passée";
  const diffWeeks = Math.floor(
    (monday.getTime() - date.getTime()) / (7 * 86400000),
  );
  if (diffWeeks < 5)
    return `Il y a ${diffWeeks + 1} semaine${diffWeeks > 0 ? "s" : ""}`;
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function HistoriqueList({ workouts }: Props) {
  const groups = useMemo(() => {
    const g: { label: string; items: HistoriqueWorkout[] }[] = [];
    for (const w of workouts) {
      const label = getGroupLabel(w.date);
      const last = g[g.length - 1];
      if (last?.label === label) last.items.push(w);
      else g.push({ label, items: [w] });
    }
    return g;
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune séance enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div>
      {groups.map(({ label, items }) => (
        <div key={label}>
          {/* Séparateur semaine */}
          <div className="flex items-center gap-3 my-4">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
          </div>

          <div className="space-y-2">
            {items.map((w) => (
              <div
                key={w.id}
                className="relative overflow-hidden rounded-[18px] p-3.5 flex items-center gap-3"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Barre accent gauche */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: 3,
                    borderRadius: "0 2px 2px 0",
                    background: "var(--accent)",
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    {w.routineNom ?? "Séance libre"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    {formatDate(w.date)}
                  </div>

                  {/* Chips méta */}
                  <div className="flex gap-1.5 flex-wrap">
                    {w.duree_minutes != null && (
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: "0.6rem",
                          background: "var(--bg-card)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ⏱ {w.duree_minutes} min
                      </span>
                    )}
                    {w.exercises.length > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: "0.6rem",
                          background: "var(--bg-card)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        🏋 {w.exercises.length} exercice
                        {w.exercises.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {w.volume > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: "0.6rem",
                          background: "var(--bg-card)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        📦 {formatVolume(w.volume)} kg
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  ›
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
