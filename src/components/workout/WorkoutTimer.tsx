"use client";

import { useEffect, useState } from "react";
import { subscribeSharedTimer } from "@/components/layout/ActiveWorkoutBanner";

interface Props {
  startedAt: number;
  pausedAt?: number | null;
  totalPausedMs?: number;
  large?: boolean;
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

  const text = formatDuration(elapsed);

  if (large) {
    return (
      <span
        className="text-4xl font-mono font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {text}
      </span>
    );
  }
  return (
    <span
      className="text-sm font-mono font-bold"
      style={{ color: "var(--accent-text)" }}
    >
      {text}
    </span>
  );
}
