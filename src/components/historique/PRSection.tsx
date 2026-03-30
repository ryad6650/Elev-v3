import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,134,12,0.12), rgba(232,134,12,0.04))",
        border: "1px solid rgba(232,134,12,0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🏆</span>
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--accent-text)" }}
        >
          Records personnels
        </p>
      </div>

      <div className="space-y-0">
        {prs.map((pr, i) => (
          <div key={i}>
            {i > 0 && (
              <div
                className="h-px my-2.5"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {pr.exerciceNom}
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--accent-text)" }}>
                {pr.poidsMax} kg × {pr.repsAuMax}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
