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
      <div className="text-center py-12 mb-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune séance enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {grouped.map(({ label, items }) => (
        <div key={label}>
          <div
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 8,
              marginTop: 8,
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
      className="flex items-center gap-2.5 cursor-pointer active:opacity-70 transition-opacity"
      style={{
        padding: "12px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.04)",
      }}
      onClick={() => onSelect?.(w.id)}
    >
      {/* Barre accent */}
      <div
        style={{
          width: 4,
          height: 44,
          borderRadius: 2,
          background: "var(--green)",
          flexShrink: 0,
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 3,
          }}
        >
          {w.routineNom ?? "Séance libre"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          {formatDate(w.date)}
        </div>
        <div className="flex gap-2">
          {w.duree_minutes != null && <Chip label={`${w.duree_minutes} min`} />}
          {w.exercises.length > 0 && (
            <Chip label={`${w.exercises.length} exos`} />
          )}
          {w.volume > 0 && <Chip label={`${formatVolume(w.volume)} kg`} />}
        </div>
      </div>

      <span
        style={{
          fontSize: 16,
          color: "var(--text-muted)",
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
      style={{
        fontFamily: "var(--font-nunito), sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "var(--text-muted)",
        background: "rgba(0,0,0,0.04)",
        borderRadius: 8,
        padding: "3px 8px",
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
