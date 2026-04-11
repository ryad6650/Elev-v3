interface Props {
  data: { date: string; poids: number }[];
}

export default function WeightMiniChart({ data }: Props) {
  const lastWeight = data[data.length - 1]?.poids;

  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-16">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Pas encore assez de données
        </p>
      </div>
    );
  }

  const W = 300;
  const H = 60;
  const PAD = 6;

  const weights = data.map((d) => d.poids);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const coords = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxW - d.poids) / range) * (H - PAD * 2);
    return { x, y };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const last = coords[coords.length - 1];

  // Aire sous la courbe (gradient)
  const areaPath =
    `M ${coords[0].x},${H} ` +
    coords.map((c) => `L ${c.x},${c.y}`).join(" ") +
    ` L ${coords[coords.length - 1].x},${H} Z`;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Poids — 30 jours
        </span>
        <span className="text-base font-bold" style={{ color: "#74BF7A" }}>
          {lastWeight} kg
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        height={60}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74BF7A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#74BF7A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Aire */}
        <path d={areaPath} fill="url(#weightGradient)" />

        {/* Ligne */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#74BF7A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dernier point */}
        <circle cx={last.x} cy={last.y} r={4} fill="#74BF7A" />
        <circle
          cx={last.x}
          cy={last.y}
          r={7}
          fill="#74BF7A"
          fillOpacity={0.2}
        />
      </svg>
    </div>
  );
}
