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
        className="font-bold uppercase mb-2.5"
        style={{
          fontSize: "10px",
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
        }}
      >
        Records personnels 🏆
      </div>
      <div className="grid grid-cols-2 gap-2">
        {prs.map((pr, i) => (
          <div key={i} style={{ padding: "10px 0" }}>
            <div style={{ fontSize: "14px", marginBottom: 3 }}>
              {MEDALS[i] ?? "⭐"}
            </div>
            <div
              className="truncate"
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginBottom: 3,
              }}
            >
              {pr.exerciceNom}
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "20px",
                  color: "#C8A055",
                  letterSpacing: "-0.02em",
                }}
              >
                {pr.poidsMax}
              </span>
              <span
                style={{
                  fontSize: "11px",
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
