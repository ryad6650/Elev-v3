"use client";

const NUTRI_ROWS: {
  label: string;
  bold?: boolean;
  sub?: boolean;
  deeper?: boolean;
}[] = [
  { label: "Calories", bold: true },
  { label: "Protéines", bold: true },
  { label: "Glucides", bold: true },
  { label: "Fibres alimentaires", sub: true },
  { label: "Sucre", sub: true },
  { label: "Sucres ajoutés", sub: true, deeper: true },
  { label: "Lipides", bold: true },
  { label: "Graisses saturées", sub: true },
  { label: "Graisses mono-insaturées", sub: true },
  { label: "Graisses polyinsaturées", sub: true },
  { label: "Gras trans", sub: true },
  { label: "Autre", bold: true },
  { label: "Cholestérol", sub: true },
  { label: "Sodium", sub: true },
  { label: "Sel", sub: true },
  { label: "Eau", sub: true },
  { label: "Alcool", sub: true },
  { label: "Vitamines", bold: true },
  { label: "Vitamine B7 (biotine)", sub: true },
  { label: "Vitamine C", sub: true },
  { label: "Vitamine D", sub: true },
  { label: "Vitamine E", sub: true },
  { label: "Vitamine K", sub: true },
];

interface NutriValues {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

interface ProgressBar {
  label: string;
  val: string;
  pct: number;
}

interface Props {
  values: NutriValues;
  progressBars: ProgressBar[];
}

export default function MealNutriSection({ values, progressBars }: Props) {
  const tableValues: Record<string, string> = {
    Calories: `${Math.round(values.calories)} kcal`,
    Protéines: `${values.proteines} g`,
    Glucides: `${values.glucides} g`,
    Lipides: `${values.lipides} g`,
  };

  return (
    <div className="mx-4 mb-8">
      <p
        className="text-[17px] font-bold mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
      >
        Valeurs nutritives
      </p>

      {/* Barres de progression */}
      <div
        className="rounded-2xl mb-4"
        style={{
          background: "#262220",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 16px",
        }}
      >
        {progressBars.map((row) => (
          <div key={row.label} className="py-2">
            <div className="flex justify-between mb-1.5">
              <span
                className="text-[13px]"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {row.label}
              </span>
              <span
                className="text-[13px]"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {row.val}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: "#74BF7A",
                  width: `${Math.min((row.pct || 0) * 100, 100)}%`,
                  transition: "width 700ms ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Table détaillée */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#262220",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {NUTRI_ROWS.map((row, i) => (
          <div
            key={row.label + i}
            className="flex items-center justify-between"
            style={{
              paddingTop: row.bold ? 14 : 9,
              paddingBottom: row.bold ? 14 : 9,
              paddingLeft: row.deeper ? 40 : row.sub ? 28 : 16,
              paddingRight: 16,
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
            }}
          >
            <span
              style={{
                fontSize: row.bold ? 15 : 14,
                fontWeight: row.bold ? 700 : 400,
                color: row.bold
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {row.label}
            </span>
            <span
              className="text-[14px]"
              style={{
                color: tableValues[row.label]
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
                fontWeight: tableValues[row.label] ? 600 : 400,
                fontFamily: "var(--font-sans)",
              }}
            >
              {tableValues[row.label] ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
