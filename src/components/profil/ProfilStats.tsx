import type { ProfilStats } from "@/lib/profil";
import { Dumbbell, Flame, Calendar } from "lucide-react";

interface Props {
  stats: ProfilStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div
      className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-1"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ color: "var(--accent)" }}>{icon}</div>
      <span
        className="text-2xl font-bold"
        style={{ color: "var(--accent-text)" }}
      >
        {value}
      </span>
      <span
        className="text-xs text-center leading-tight"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ProfilStatsSection({ stats }: Props) {
  return (
    <div className="flex gap-3 mb-5">
      <StatCard
        icon={<Dumbbell size={20} />}
        value={stats.totalSeances}
        label="Séances totales"
      />
      <StatCard
        icon={<Calendar size={20} />}
        value={stats.seancesCeMois}
        label="Ce mois"
      />
      <StatCard
        icon={<Flame size={20} />}
        value={stats.streakActuel}
        label="Jours streak"
      />
    </div>
  );
}
