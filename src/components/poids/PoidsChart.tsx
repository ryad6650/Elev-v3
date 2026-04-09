"use client";

import { useState, useMemo } from "react";
import type { PoidsEntry } from "@/lib/poids";

type Periode = "1S" | "1M" | "3M" | "6M";
const PERIODES: { key: Periode; label: string; days: number }[] = [
  { key: "1S", label: "1S", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "6M", label: "6M", days: 180 },
];

const W = 300;
const H = 60;

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
  const [periode, setPeriode] = useState<Periode>("1M");
  const periodeConfig = PERIODES.find((p) => p.key === periode)!;

  const filtered = useMemo(
    () => filterByPeriode(entries, periodeConfig.days),
    [entries, periodeConfig.days],
  );

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const vals = filtered.map((e) => e.poids);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const avg =
      Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
    const delta = Math.round((vals[vals.length - 1] - vals[0]) * 10) / 10;
    return { max, min, avg, delta };
  }, [filtered]);

  const chart = useMemo(() => {
    if (filtered.length < 2) return null;
    const vals = filtered.map((e) => e.poids);
    const maVals = calcMovingAvg(vals);
    const minV = Math.min(...maVals);
    const maxV = Math.max(...maVals);
    const range = maxV - minV || 1;
    const pad = range * 0.15;
    const yMin = minV - pad;
    const yMax = maxV + pad;
    const yRange = yMax - yMin;

    const toX = (i: number) => (i / (maVals.length - 1)) * W;
    const toY = (v: number) => ((yMax - v) / yRange) * H;

    const points = maVals.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
      .join(" ");
    const areaPath =
      `M ${points[0].x},${H} ` +
      points.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${points[points.length - 1].x},${H} Z`;
    const last = points[points.length - 1];
    return { linePath, areaPath, last };
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--glass-border)",
          padding: 20,
          marginBottom: 14,
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
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
        marginBottom: 14,
      }}
    >
      {/* Header + pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Évolution
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {PERIODES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriode(p.key)}
              style={{
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
                color: periode === p.key ? "#fff" : "var(--text-muted)",
                background:
                  periode === p.key ? "var(--green)" : "rgba(0,0,0,0.04)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ height: 64, marginBottom: 18 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="poidsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a9d6e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2a9d6e" stopOpacity={0} />
            </linearGradient>
          </defs>
          {chart ? (
            <>
              <path d={chart.areaPath} fill="url(#poidsGrad)" />
              <path
                d={chart.linePath}
                fill="none"
                stroke="var(--green)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={chart.last.x}
                cy={chart.last.y}
                r={4}
                fill="var(--green)"
              />
              <circle
                cx={chart.last.x}
                cy={chart.last.y}
                r={8}
                fill="var(--green)"
                opacity={0.15}
              />
            </>
          ) : (
            <text
              x={W / 2}
              y={H / 2}
              textAnchor="middle"
              fontSize={11}
              fill="var(--text-muted)"
            >
              Pas assez de données
            </text>
          )}
        </svg>
      </div>

      {/* Stats row */}
      {stats && (
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
        >
          {[
            { value: stats.max, label: "Max" },
            { value: stats.avg, label: "Moyenne" },
            { value: stats.min, label: "Min" },
            { value: stats.delta, label: "Delta", isGreen: true },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                background: "rgba(0,0,0,0.03)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: s.isGreen ? "var(--green)" : "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {s.isGreen && s.value <= 0
                  ? ""
                  : s.isGreen && s.value > 0
                    ? "+"
                    : ""}
                {s.isGreen
                  ? s.value <= 0
                    ? `−${Math.abs(s.value)}`
                    : s.value
                  : s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
