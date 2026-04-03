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

const W = 360;
const H = 120;
const PAD = { top: 10, right: 16, bottom: 20, left: 30 };
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

    const points = filtered.map((e, i) => ({
      ...e,
      x: toX(i),
      y: toY(e.poids),
    }));
    const maVals = calcMovingAvg(vals);
    const maPoints = maVals.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const maPath = maPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
      .join(" ");
    const areaPath =
      `M ${maPoints[0].x},${PAD.top + innerH} ` +
      maPoints.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${maPoints[maPoints.length - 1].x},${PAD.top + innerH} Z`;

    const yLabels = [
      { value: Math.round(minP * 10) / 10, y: toY(minP) },
      { value: Math.round(maxP * 10) / 10, y: toY(maxP) },
    ];

    const last = points[points.length - 1];
    return { maPath, areaPath, yLabels, last };
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 mb-3 flex items-center justify-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          height: 80,
        }}
      >
        <p
          className="text-sm text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Ajoutez votre premier poids pour voir le graphique
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl mb-3"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        padding: 18,
      }}
    >
      {/* Header avec pills période */}
      <div className="flex items-center justify-between mb-3.5">
        <div
          className="font-semibold uppercase"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            letterSpacing: "0.07em",
          }}
        >
          Évolution — {periodeConfig.label}
        </div>
        <div className="flex gap-1">
          {PERIODES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriode(p.key)}
              className="rounded-full transition-colors"
              style={{
                padding: "3px 9px",
                fontSize: "0.62rem",
                fontWeight: 600,
                background:
                  periode === p.key ? "var(--accent-bg)" : "transparent",
                color:
                  periode === p.key ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div style={{ position: "relative", height: H }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: H, overflow: "visible" }}
        >
          <defs>
            <linearGradient id="poidsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grilles */}
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.left}
              y1={PAD.top + innerH * t}
              x2={PAD.left + innerW}
              y2={PAD.top + innerH * t}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* Y labels */}
          {chart?.yLabels.map((l) => (
            <text
              key={l.value}
              x={PAD.left - 5}
              y={l.y + 3}
              textAnchor="end"
              fontSize={7}
              fill="rgba(255,255,255,0.3)"
              fontFamily="var(--font-dm-sans)"
            >
              {l.value}
            </text>
          ))}

          {chart ? (
            <>
              <path d={chart.areaPath} fill="url(#poidsGrad)" />
              <path
                d={chart.maPath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dernier point */}
              <circle
                cx={chart.last.x}
                cy={chart.last.y}
                r={4}
                fill="var(--accent)"
                filter="drop-shadow(0 0 4px color-mix(in srgb, var(--accent) 60%, transparent))"
              />
              <circle cx={chart.last.x} cy={chart.last.y} r={2} fill="#fff" />
            </>
          ) : (
            <text
              x={W / 2}
              y={H / 2}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(255,255,255,0.3)"
              fontFamily="var(--font-dm-sans)"
            >
              Pas assez de données
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
