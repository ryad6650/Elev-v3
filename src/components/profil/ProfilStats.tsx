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
      className="flex-1 p-4 flex flex-col items-center gap-1"
      style={{
        background: "#262220",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ color: "#74BF7A" }}>{icon}</div>
      <span className="text-2xl font-bold" style={{ color: "#74BF7A" }}>
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
