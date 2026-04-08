import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

  return (
    <div className="mb-2.5">
      <div
        className="font-bold uppercase mb-2"
        style={{
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "0.22em",
          padding: "2px 2px 0",
        }}
      >
        Records personnels
      </div>
      <div className="grid grid-cols-2 gap-2">
        {prs.map((pr, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-2xl px-3.5 py-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🥇</span>
            <div className="flex-1 min-w-0">
              <div
                className="truncate"
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  marginBottom: 2,
                }}
              >
                {pr.exerciceNom}
              </div>
              <div
                className="font-bold"
                style={{ fontSize: "14px", color: "#C8A055" }}
              >
                {pr.poidsMax} kg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
