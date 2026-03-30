import type { PoidsEntry } from "@/lib/poids";

interface Props {
  entries: PoidsEntry[];
}

function refBeforeDays(entries: PoidsEntry[], days: number): number | null {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const older = entries.filter((e) => e.date < cutoffStr);
  return older.length > 0 ? older[older.length - 1].poids : null;
}

function StatItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-3"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p className="text-base font-bold" style={{ color: "var(--accent-text)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function PoidsStats({ entries }: Props) {
  if (entries.length === 0) return null;

  const current = entries[entries.length - 1].poids;

  const ref7 = refBeforeDays(entries, 7);
  const diff7 =
    ref7 !== null ? Math.round((current - ref7) * 10) / 10 : null;

  const ref30 = refBeforeDays(entries, 30);
  const diff30 =
    ref30 !== null ? Math.round((current - ref30) * 10) / 10 : null;

  const allPoids = entries.map((e) => e.poids);
  const min = Math.min(...allPoids);
  const max = Math.max(...allPoids);

  const fmt = (d: number) => (d > 0 ? `+${d}` : `${d}`);

  return (
    <div className="flex gap-2 mb-4">
      <StatItem label="Actuel" value={`${current} kg`} />
      <StatItem
        label="7 jours"
        value={diff7 !== null ? `${fmt(diff7)} kg` : "—"}
      />
      <StatItem
        label="30 jours"
        value={diff30 !== null ? `${fmt(diff30)} kg` : "—"}
      />
      <StatItem label="Min / Max" value={`${min}`} sub={`→ ${max} kg`} />
    </div>
  );
}
