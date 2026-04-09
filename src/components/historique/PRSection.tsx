import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

const MEDALS = ["🥇", "🥈", "🥉", "⭐"];

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 12,
        }}
      >
        Records personnels
      </div>
      <div className="grid grid-cols-2 gap-3">
        {prs.map((pr, i) => (
          <div
            key={i}
            style={{
              background: "rgba(0,0,0,0.03)",
              borderRadius: "var(--radius-sm)",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 4 }}>
              {MEDALS[i] ?? "⭐"}
            </div>
            <div
              className="truncate"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              {pr.exerciceNom}
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--green)",
                  letterSpacing: "-0.02em",
                }}
              >
                {pr.poidsMax}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginLeft: 3,
                }}
              >
                kg × {pr.repsAuMax}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
