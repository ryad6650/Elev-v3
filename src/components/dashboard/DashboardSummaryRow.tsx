"use client";

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

interface Props {
  calories: number;
  objectifCalories: number;
  poids: number | null;
  sommeilMinutes: number | null;
}

export default function DashboardSummaryRow({
  calories,
  objectifCalories,
  poids,
  sommeilMinutes,
}: Props) {
  const calPct =
    objectifCalories > 0
      ? Math.min(Math.round((calories / objectifCalories) * 100), 100)
      : 0;
  const sommeilPct =
    sommeilMinutes != null
      ? Math.min(Math.round((sommeilMinutes / 480) * 100), 100)
      : 0;

  const items = [
    {
      value: calories.toLocaleString("fr-FR"),
      label: "kcal",
      pct: calPct,
      color: "#00FFC3",
    },
    {
      value: poids != null ? poids.toString() : "—",
      label: "kg",
      pct: poids != null ? 88 : 0,
      color: "#34d399",
    },
    {
      value: sommeilMinutes != null ? formatSleep(sommeilMinutes) : "—",
      label: "sommeil",
      pct: sommeilPct,
      color: "#a78bfa",
    },
  ];

  return (
    <div className="flex gap-3" style={{ marginBottom: 20 }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 text-center"
          style={{
            background: "#1C1C1E",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "18px 14px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              marginTop: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: item.color,
                width: `${item.pct}%`,
                transition: "width 700ms ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
