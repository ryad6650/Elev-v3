import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
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
  if (v >= 1000) {
    const formatted = new Intl.NumberFormat("fr-FR").format(v);
    return formatted;
  }
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
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune séance enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {grouped.map(({ items }) =>
        items.map((w) => <WorkoutItem key={w.id} w={w} onSelect={onSelect} />),
      )}
    </div>
  );
}

function WorkoutItem({
  w,
  onSelect,
}: {
  w: HistoriqueWorkout;
  onSelect?: (id: string) => void;
}) {
  return (
    <div
      className="relative flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "12px 14px 12px 18px",
      }}
      onClick={() => onSelect?.(w.id)}
    >
      {/* Barre verte gauche */}
      <div
        className="absolute rounded-sm"
        style={{
          left: 8,
          top: 10,
          bottom: 10,
          width: 2,
          background: "#74BF7A",
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          className="font-bold truncate leading-tight"
          style={{ fontSize: "15px", color: "var(--text-primary)" }}
        >
          {w.routineNom ?? "Séance libre"}
        </div>
        <div
          style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 2 }}
        >
          {formatDate(w.date)}
        </div>
        <div className="flex gap-1 mt-1.5">
          {w.duree_minutes != null && <Chip label={`${w.duree_minutes} MIN`} />}
          {w.exercises.length > 0 && (
            <Chip label={`${w.exercises.length} EXOS`} />
          )}
          {w.volume > 0 && <Chip label={`${formatVolume(w.volume)} KG`} />}
        </div>
      </div>

      {/* Flèche */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--bg-card)",
        }}
      >
        <ArrowRight size={11} style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="font-semibold"
      style={{
        fontSize: "8px",
        color: "var(--text-secondary)",
        background: "var(--bg-card)",
        borderRadius: 4,
        padding: "2px 6px",
        letterSpacing: "0.05em",
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
