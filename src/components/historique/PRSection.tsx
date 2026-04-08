import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

const MEDALS = ["🥇", "🥈", "🥉", "⭐"];

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

  return (
    <div
      className="mb-2.5"
      style={{
        borderTop: "1px solid rgba(74,55,40,0.08)",
        paddingTop: 10,
      }}
    >
      <div
        className="font-bold uppercase mb-2"
        style={{
          fontSize: "8px",
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
        }}
      >
        Records personnels 🏆
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {prs.map((pr, i) => (
          <div key={i} style={{ padding: "8px 0" }}>
            <div style={{ fontSize: "12px", marginBottom: 2 }}>
              {MEDALS[i] ?? "⭐"}
            </div>
            <div
              className="truncate"
              style={{
                fontSize: "8px",
                color: "var(--text-muted)",
                marginBottom: 2,
              }}
            >
              {pr.exerciceNom}
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "16px",
                  color: "#C8A055",
                  letterSpacing: "-0.02em",
                }}
              >
                {pr.poidsMax}
              </span>
              <span
                style={{
                  fontSize: "9px",
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
