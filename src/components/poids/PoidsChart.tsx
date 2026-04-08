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
const H = 100;
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
        className="flex items-center justify-center"
        style={{
          padding: "14px 0",
          borderBottom: "1px solid rgba(74,55,40,0.08)",
          marginBottom: 6,
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
      style={{
        padding: "14px 0",
        borderBottom: "1px solid rgba(74,55,40,0.08)",
        marginBottom: 6,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Évolution
      </div>

      {/* Period pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {PERIODES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriode(p.key)}
            style={{
              padding: "3px 10px",
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: periode === p.key ? "#fff" : "var(--text-muted)",
              background:
                periode === p.key
                  ? "linear-gradient(135deg, var(--bar-from), var(--bar-to))"
                  : "rgba(74,55,40,0.06)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 100 }}
      >
        <defs>
          <linearGradient id="poidsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a0785c" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#a0785c" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.2, 0.5, 0.8].map((t) => (
          <line
            key={t}
            x1={0}
            y1={PAD.top + innerH * t}
            x2={W}
            y2={PAD.top + innerH * t}
            stroke="rgba(74,55,40,0.08)"
            strokeWidth={0.5}
          />
        ))}

        {chart ? (
          <>
            <path d={chart.areaPath} fill="url(#poidsGrad)" />
            <path
              d={chart.maPath}
              fill="none"
              stroke="#a0785c"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dernier point */}
            <circle
              cx={chart.last.x}
              cy={chart.last.y}
              r={4}
              fill="#a0785c"
              stroke="#fff"
              strokeWidth={2}
            />
          </>
        ) : (
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--text-secondary)"
          >
            Pas assez de données
          </text>
        )}

        {/* Y labels dans le SVG */}
        {chart?.yLabels.map((l) => (
          <text
            key={l.value}
            x={2}
            y={l.y + 3}
            fontSize={7}
            fill="var(--text-secondary)"
            fontFamily="var(--font-dm-sans)"
          >
            {l.value}
          </text>
        ))}
      </svg>
    </div>
  );
}
