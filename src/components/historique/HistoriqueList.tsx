import { useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  onSelect?: (id: string) => void;
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
  return (
    d.toLocaleDateString("fr-FR", { weekday: "long" }).charAt(0).toUpperCase() +
    d.toLocaleDateString("fr-FR", { weekday: "long" }).slice(1) +
    ` · ${dateLabel}`
  );
}

function formatVolume(v: number): string {
  if (v >= 1000) return new Intl.NumberFormat("fr-FR").format(v);
  return String(v);
}

export default function HistoriqueList({ workouts, onSelect }: Props) {
  const grouped = useMemo(() => {
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
      <div className="text-center py-12 mb-2.5">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune séance enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-2.5">
      {grouped.map(({ label, items }) => (
        <div key={label}>
          <div
            className="font-bold uppercase"
            style={{
              fontSize: "8px",
              letterSpacing: "0.1em",
              color: "var(--text-secondary)",
              marginBottom: 6,
              marginTop: 4,
            }}
          >
            {label}
          </div>
          {items.map((w, idx) => (
            <WorkoutItem
              key={w.id}
              w={w}
              onSelect={onSelect}
              isLast={idx === items.length - 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function WorkoutItem({
  w,
  onSelect,
  isLast,
}: {
  w: HistoriqueWorkout;
  onSelect?: (id: string) => void;
  isLast: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity"
      style={{
        padding: "10px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(74,55,40,0.08)",
      }}
      onClick={() => onSelect?.(w.id)}
    >
      {/* Barre accent gradient */}
      <div
        style={{
          width: 3,
          height: 36,
          borderRadius: 2,
          background: "linear-gradient(180deg, #c4a882, #a0785c)",
          flexShrink: 0,
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "13px",
            color: "var(--text-primary)",
            marginBottom: 2,
          }}
        >
          {w.routineNom ?? "Séance libre"}
        </div>
        <div
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          {formatDate(w.date)}
        </div>
        <div className="flex gap-1.5">
          {w.duree_minutes != null && <Chip label={`${w.duree_minutes} min`} />}
          {w.exercises.length > 0 && (
            <Chip label={`${w.exercises.length} exos`} />
          )}
          {w.volume > 0 && <Chip label={`${formatVolume(w.volume)} kg`} />}
        </div>
      </div>

      {/* Flèche */}
      <span
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        ›
      </span>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="font-bold uppercase"
      style={{
        fontSize: "7px",
        letterSpacing: "0.04em",
        color: "var(--text-muted)",
        background: "rgba(74,55,40,0.06)",
        borderRadius: 6,
        padding: "2px 7px",
      }}
    >
      {label}
    </span>
  );
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
