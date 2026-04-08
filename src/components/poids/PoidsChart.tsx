"use client";

import { useState, useMemo } from "react";
import type { PoidsEntry } from "@/lib/poids";

type Periode = "7j" | "30j" | "3m" | "1an";
const PERIODES: { key: Periode; label: string; days: number }[] = [
  { key: "7j", label: "7j", days: 7 },
  { key: "30j", label: "30j", days: 30 },
  { key: "3m", label: "3m", days: 90 },
  { key: "1an", label: "1an", days: 365 },
];

const W = 240;
const H = 130;
const PAD = { top: 8, right: 8, bottom: 4, left: 28 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function filterByPeriode(entries: PoidsEntry[], days: number): PoidsEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return entries.filter((e) => e.date >= cutoffStr);
}

function calcMovingAvg(vals: number[], window = 7): number[] {
  return vals.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = vals.slice(start, i + 1);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}

interface Props {
  entries: PoidsEntry[];
}

export default function PoidsChart({ entries }: Props) {
  const [periode, setPeriode] = useState<Periode>("30j");
  const periodeConfig = PERIODES.find((p) => p.key === periode)!;

  const filtered = useMemo(
    () => filterByPeriode(entries, periodeConfig.days),
    [entries, periodeConfig.days],
  );

  const chart = useMemo(() => {
    if (filtered.length < 2) return null;
    const vals = filtered.map((e) => e.poids);
    const minP = Math.min(...vals);
    const maxP = Math.max(...vals);
    const rawRange = maxP - minP || 1;
    const pad = rawRange * 0.15;
    const yMin = minP - pad;
    const yMax = maxP + pad;
    const yRange = yMax - yMin;

    const toX = (i: number) => PAD.left + (i / (filtered.length - 1)) * innerW;
    const toY = (v: number) => PAD.top + ((yMax - v) / yRange) * innerH;

    const maVals = calcMovingAvg(vals);
    const maPoints = maVals.map((v, i) => ({
      date: filtered[i].date,
      x: toX(i),
      y: toY(v),
    }));
    const maPath = maPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
      .join(" ");
    const areaPath =
      `M ${maPoints[0].x},${PAD.top + innerH} ` +
      maPoints.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${maPoints[maPoints.length - 1].x},${PAD.top + innerH} Z`;

    const mid = Math.round(((minP + maxP) / 2) * 10) / 10;
    const yLabels = [
      { value: Math.round(maxP * 10) / 10, y: toY(maxP) },
      { value: mid, y: toY(mid) },
      { value: Math.round(minP * 10) / 10, y: toY(minP) },
    ];

    const last = maPoints[maPoints.length - 1];
    return { maPoints, maPath, areaPath, yLabels, last };
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div
        className="flex items-center justify-center mb-2.5"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "16px 18px",
          height: 80,
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Ajoutez votre premier poids pour voir le graphique
        </p>
      </div>
    );
  }

  return (
    <div
      className="mb-2.5"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "16px 18px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Évolution
      </div>

      {/* Period pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {PERIODES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriode(p.key)}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              color: periode === p.key ? "#FAFAF9" : "var(--text-muted)",
              padding: "5px 0",
              borderRadius: 8,
              background:
                periode === p.key ? "var(--accent)" : "var(--bg-card)",
              border:
                periode === p.key
                  ? "1px solid rgba(116,191,122,0.2)"
                  : "1px solid var(--border)",
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{ position: "relative", height: H, marginBottom: 4 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="poidsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A9B54" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4A9B54" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={0}
              y1={PAD.top + innerH * t}
              x2={W}
              y2={PAD.top + innerH * t}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.5}
            />
          ))}

          {chart ? (
            <>
              <path d={chart.areaPath} fill="url(#poidsGrad)" />
              <path
                d={chart.maPath}
                fill="none"
                stroke="#4A9B54"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Dernier point */}
              <circle
                cx={chart.last.x}
                cy={chart.last.y}
                r={4}
                fill="#4A9B54"
                stroke="var(--bg-secondary)"
                strokeWidth={2}
              />
            </>
          ) : (
            <text
              x={W / 2}
              y={H / 2}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(255,255,255,0.3)"
            >
              Pas assez de données
            </text>
          )}
        </svg>

        {/* Y labels */}
        {chart && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "2px 0",
              pointerEvents: "none",
            }}
          >
            {chart.yLabels.map((l) => (
              <span
                key={l.value}
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {l.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
