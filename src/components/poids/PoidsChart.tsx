"use client";

import { useState, useMemo } from "react";
import type { PoidsEntry } from "@/lib/poids";

type Periode = "7j" | "30j" | "3m" | "6m" | "tout";
const PERIODES: Periode[] = ["7j", "30j", "3m", "6m", "tout"];

const W = 360;
const H = 180;
const PAD = { top: 12, right: 16, bottom: 24, left: 38 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function filterByPeriode(entries: PoidsEntry[], periode: Periode): PoidsEntry[] {
  if (periode === "tout") return entries;
  const days = { "7j": 7, "30j": 30, "3m": 90, "6m": 180 }[periode];
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

  const filtered = useMemo(() => filterByPeriode(entries, periode), [entries, periode]);

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

    const points = filtered.map((e, i) => ({ ...e, x: toX(i), y: toY(e.poids) }));
    const maVals = calcMovingAvg(vals);
    const maPoints = maVals.map((v, i) => ({ x: toX(i), y: toY(v) }));

    const maPath = maPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
    const areaPath =
      `M ${maPoints[0].x},${PAD.top + innerH} ` +
      maPoints.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${maPoints[maPoints.length - 1].x},${PAD.top + innerH} Z`;

    const yLabels = [
      { value: Math.round(minP * 10) / 10, y: toY(minP) },
      { value: Math.round((minP + maxP) / 2 * 10) / 10, y: toY((minP + maxP) / 2) },
      { value: Math.round(maxP * 10) / 10, y: toY(maxP) },
    ];

    const last = points[points.length - 1];
    return { points, maPath, areaPath, yLabels, last };
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl p-5 mb-4 flex items-center justify-center h-32"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Ajoutez votre premier poids pour voir le graphique
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 mb-4"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex gap-1.5 mb-4">
        {PERIODES.map((p) => (
          <button key={p} onClick={() => setPeriode(p)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: periode === p ? "var(--accent)" : "var(--bg-card)",
              color: periode === p ? "#fff" : "var(--text-secondary)",
            }}>
            {p === "tout" ? "Tout" : p}
          </button>
        ))}
      </div>

      {chart ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" height={H}>
          <defs>
            <linearGradient id="poidsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.yLabels.map((l) => (
            <text key={l.value} x={PAD.left - 6} y={l.y + 4}
              textAnchor="end" fontSize={9} fill="var(--text-muted)">
              {l.value}
            </text>
          ))}

          <path d={chart.areaPath} fill="url(#poidsAreaGrad)" />

          <path d={chart.maPath} fill="none" stroke="var(--accent)"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {chart.points.map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r={2.5}
              fill="var(--accent)" fillOpacity={0.6} />
          ))}

          <circle cx={chart.last.x} cy={chart.last.y} r={5} fill="var(--accent)" />
          <circle cx={chart.last.x} cy={chart.last.y} r={9}
            fill="var(--accent)" fillOpacity={0.2} />
        </svg>
      ) : (
        <div className="flex items-center justify-center h-20">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Pas assez de données sur cette période
          </p>
        </div>
      )}
    </div>
  );
}
