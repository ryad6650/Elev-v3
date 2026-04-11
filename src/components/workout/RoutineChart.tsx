"use client";

import type { RoutineVolumePoint } from "@/app/actions/routine-detail";

export type ChartTab = "volume" | "reps" | "duree";

interface Props {
  points: RoutineVolumePoint[];
  tab: ChartTab;
}

function fmtVal(v: number, tab: ChartTab) {
  if (tab === "volume") return `${v} kg`;
  if (tab === "reps") return `${v}`;
  return `${v} min`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    month: "short",
    day: "numeric",
  });
}

export default function RoutineChart({ points, tab }: Props) {
  if (points.length === 0) {
    return (
      <div
        style={{
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#6E6E73", fontSize: 13 }}>
          Aucune séance enregistrée
        </span>
      </div>
    );
  }

  const values = points.map((p) =>
    tab === "volume"
      ? p.volume
      : tab === "reps"
        ? p.totalReps
        : (p.duree_minutes ?? 0),
  );

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  const W = 320,
    H = 100;
  const pad = { top: 8, bottom: 20, left: 52, right: 8 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const getX = (i: number) =>
    pad.left + (points.length === 1 ? cW / 2 : (i / (points.length - 1)) * cW);
  const getY = (v: number) => pad.top + cH - ((v - minVal) / range) * cH;

  const pathD = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`)
    .join(" ");
  const last = points.length - 1;
  const midVal = minVal + range / 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: "visible", display: "block" }}
    >
      {[minVal, midVal, maxVal].map((v, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={getY(v)}
            x2={W - pad.right}
            y2={getY(v)}
            stroke="#2A2A2A"
            strokeWidth={0.8}
          />
          <text
            x={pad.left - 4}
            y={getY(v) + 4}
            textAnchor="end"
            fill="#6E6E73"
            fontSize={9}
          >
            {fmtVal(Math.round(v), tab)}
          </text>
        </g>
      ))}
      {points.length > 1 && (
        <path d={pathD} fill="none" stroke="#74BF7A" strokeWidth={1.5} />
      )}
      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={getX(i)}
          cy={getY(values[i])}
          r={i === last ? 5 : 3}
          fill="#74BF7A"
        />
      ))}
      <text
        x={getX(0)}
        y={H - 2}
        textAnchor="middle"
        fill="#6E6E73"
        fontSize={9}
      >
        {fmtDate(points[0].date)}
      </text>
      {points.length > 1 && (
        <text
          x={getX(last)}
          y={H - 2}
          textAnchor="middle"
          fill="#6E6E73"
          fontSize={9}
        >
          {fmtDate(points[last].date)}
        </text>
      )}
    </svg>
  );
}
