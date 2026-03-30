import { Calendar, Clock, Zap } from "lucide-react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr + "T12:00:00"));
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
    (monday.getTime() - date.getTime()) / (7 * 86400000)
  );
  if (diffWeeks < 5)
    return `Il y a ${diffWeeks + 1} semaine${diffWeeks > 0 ? "s" : ""}`;

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatVolume(v: number): string {
  return v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v);
}

export default function HistoriqueList({ workouts }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune séance sur cette période.
        </p>
      </div>
    );
  }

  // Grouper par label de semaine
  const groups: { label: string; items: HistoriqueWorkout[] }[] = [];
  for (const w of workouts) {
    const label = getGroupLabel(w.date);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(w);
    else groups.push({ label, items: [w] });
  }

  return (
    <div>
      {groups.map(({ label, items }) => (
        <div key={label}>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div className="space-y-2.5">
            {items.map((w) => (
              <div
                key={w.id}
                className="rounded-[18px] p-4"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p
                      className="text-base leading-tight mb-1"
                      style={{
                        fontFamily: "var(--font-dm-serif)",
                        fontStyle: "italic",
                        color: "var(--text-primary)",
                      }}
                    >
                      {w.routineNom ?? "Séance libre"}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Calendar size={11} />
                        {formatDate(w.date)}
                      </span>
                      {w.duree_minutes != null && (
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Clock size={11} />
                          {w.duree_minutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  {w.volume > 0 && (
                    <span
                      className="flex items-center gap-1 text-sm font-bold shrink-0"
                      style={{ color: "var(--accent-text)" }}
                    >
                      <Zap size={13} />
                      {formatVolume(w.volume)} kg
                    </span>
                  )}
                </div>

                {w.exercises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {w.exercises.slice(0, 4).map((ex, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {ex.nom} ×{ex.setsCount}
                      </span>
                    ))}
                    {w.exercises.length > 4 && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-muted)",
                        }}
                      >
                        +{w.exercises.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
