"use client";

import { useEffect, useState } from "react";
import { subscribeSharedTimer } from "@/components/layout/ActiveWorkoutBanner";

interface Props {
  startedAt: number;
  pausedAt?: number | null;
  totalPausedMs?: number;
  large?: boolean;
  compact?: boolean;
}

function formatDuration(ms: number, alwaysHours = false): string {
  const totalSecs = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (alwaysHours || h > 0)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatCompact(ms: number): string {
  const secs = Math.floor(Math.max(0, ms) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function calcElapsed(
  startedAt: number,
  pausedAt: number | null,
  totalPausedMs: number,
) {
  const pauseOffset = pausedAt ? Date.now() - pausedAt : 0;
  return Date.now() - startedAt - totalPausedMs - pauseOffset;
}

export default function WorkoutTimer({
  startedAt,
  pausedAt = null,
  totalPausedMs = 0,
  large = false,
  compact = false,
}: Props) {
  const [elapsed, setElapsed] = useState(() =>
    calcElapsed(startedAt, pausedAt, totalPausedMs),
  );

  useEffect(() => {
    if (pausedAt !== null) return;
    return subscribeSharedTimer(() =>
      setElapsed(calcElapsed(startedAt, pausedAt, totalPausedMs)),
    );
  }, [startedAt, pausedAt, totalPausedMs]);

  if (compact) {
    return (
      <span
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--accent)",
        }}
      >
        {formatCompact(elapsed)}
      </span>
    );
  }

  if (large) {
    return (
      <span
        className="text-[28px] tracking-[-0.02em] leading-[1.2]"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {formatDuration(elapsed, true)}
      </span>
    );
  }

  return (
    <span
      className="text-sm font-mono font-bold"
      style={{ color: "var(--accent-text)" }}
    >
      {formatDuration(elapsed)}
    </span>
  );
}
