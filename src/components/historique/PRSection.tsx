import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

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
        Records personnels
      </div>
      <div className="flex gap-2">
        {prs.map((pr, i) => (
          <div
            key={i}
            className="card-surface flex-1"
            style={{
              padding: "12px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>
              {MEDALS[i] ?? "⭐"}
            </div>
            <div
              className="truncate"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 2,
                lineHeight: 1.2,
              }}
            >
              {pr.exerciceNom}
            </div>
            <div
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#74BF7A",
                lineHeight: 1,
              }}
            >
              {pr.poidsMax}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}
            >
              kg × {pr.repsAuMax} reps
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
