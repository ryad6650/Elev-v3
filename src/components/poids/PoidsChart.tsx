"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  const [periode, setPeriode] = useState<Periode>("1S");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const periodeConfig = PERIODES.find((p) => p.key === periode)!;

  useEffect(() => {
    if (selectedIdx === null) return;
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (chartRef.current?.contains(e.target as Node)) return;
      setSelectedIdx(null);
    };
    document.addEventListener("pointerdown", handleTap);
    return () => document.removeEventListener("pointerdown", handleTap);
  }, [selectedIdx]);

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
    const dates = filtered.map((e) => new Date(e.date).getTime());
    const maVals = calcMovingAvg(vals);
    const allVals = [...vals, ...maVals];
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const range = maxV - minV || 1;
    const pad = range * 0.15;
    const yMin = minV - pad;
    const yMax = maxV + pad;
    const yRange = yMax - yMin;

    const dateMin = dates[0];
    const dateMax = dates[dates.length - 1];
    const dateRange = dateMax - dateMin || 1;
    const pad_x = 6;
    const toX = (i: number) =>
      pad_x + ((dates[i] - dateMin) / dateRange) * (W - pad_x * 2);
    const toY = (v: number) => ((yMax - v) / yRange) * H;

    const rawVals = filtered.map((e) => e.poids);
    const rawDates = filtered.map((e) => e.date);
    const rawPoints = rawVals.map((v, i) => ({ x: toX(i), y: toY(v) }));

    // Spline cubique naturelle
    const spline = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return "";
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const t = 0.35;
        const cp1x = p1.x + (p2.x - p0.x) * t;
        const cp1y = p1.y + (p2.y - p0.y) * t;
        const cp2x = p2.x - (p3.x - p1.x) * t;
        const cp2y = p2.y - (p3.y - p1.y) * t;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    };

    const linePath = spline(rawPoints);
    const areaPath =
      `M ${rawPoints[0].x},${H} L ${rawPoints[0].x},${rawPoints[0].y}` +
      linePath.slice(linePath.indexOf("C") - 1) +
      ` L ${rawPoints[rawPoints.length - 1].x},${H} Z`;
    const last = rawPoints[rawPoints.length - 1];
    return { linePath, areaPath, last, points: rawPoints, rawVals, rawDates };
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
      ref={chartRef}
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
            fontFamily: "var(--font-nunito), sans-serif",
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
              onClick={() => {
                setPeriode(p.key);
                setSelectedIdx(null);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-nunito), sans-serif",
                color: periode === p.key ? "#fff" : "var(--text-muted)",
                background: periode === p.key ? "#74BF7A" : "rgba(0,0,0,0.04)",
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
          role="img"
          aria-label="Courbe de poids"
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
                stroke="#74BF7A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Halo dernier point */}
              <circle
                cx={chart.last.x}
                cy={chart.last.y}
                r={8}
                fill="#74BF7A"
                opacity={0.15}
                style={{ pointerEvents: "none" }}
              />
              {chart.points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={
                      selectedIdx === i
                        ? 5
                        : i === chart.points.length - 1
                          ? 5
                          : 3.5
                    }
                    fill="#74BF7A"
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Zone de tap invisible */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    fill="transparent"
                    onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                  />
                </g>
              ))}
              {/* Tooltip */}
              {selectedIdx !== null && chart.points[selectedIdx] && (
                <g>
                  <line
                    x1={chart.points[selectedIdx].x}
                    y1={0}
                    x2={chart.points[selectedIdx].x}
                    y2={H}
                    stroke="#74BF7A"
                    strokeWidth={0.5}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                  <rect
                    x={Math.min(chart.points[selectedIdx].x - 28, W - 56)}
                    y={Math.max(chart.points[selectedIdx].y - 28, 0)}
                    width={56}
                    height={22}
                    rx={6}
                    fill="var(--bg-card, #1c1917)"
                    stroke="#74BF7A"
                    strokeWidth={0.5}
                    opacity={0.95}
                  />
                  <text
                    x={Math.min(chart.points[selectedIdx].x, W - 28)}
                    y={Math.max(chart.points[selectedIdx].y - 28, 0) + 14.5}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill="#74BF7A"
                  >
                    {chart.rawVals[selectedIdx]} kg
                  </text>
                </g>
              )}
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
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: s.isGreen ? "#74BF7A" : "var(--text-primary)",
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
                  fontFamily: "var(--font-nunito), sans-serif",
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
