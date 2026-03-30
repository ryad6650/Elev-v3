import type { PRRecord } from "@/lib/historique";

interface Props {
  prs: PRRecord[];
}

export default function PRSection({ prs }: Props) {
  if (prs.length === 0) return null;

  return (
    <div className="mb-4">
      <div
        className="font-semibold uppercase mb-2.5"
        style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "0.07em" }}
      >
        Records personnels 🏆
      </div>
      <div className="grid grid-cols-2 gap-2">
        {prs.map((pr, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-[18px] px-3.5 py-3"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🥇</span>
            <div className="flex-1 min-w-0">
              <div
                className="truncate"
                style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: 2 }}
              >
                {pr.exerciceNom}
              </div>
              <div
                className="font-bold"
                style={{ fontSize: "0.9rem", color: "#D4A843" }}
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
