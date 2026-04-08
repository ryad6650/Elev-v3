"use client";

import { useEffect, useState } from "react";
import { subscribeSharedTimer } from "@/components/layout/ActiveWorkoutBanner";

interface Props {
  startedAt: number;
  pausedAt?: number | null;
  totalPausedMs?: number;
  large?: boolean;
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

  if (large) {
    const text = formatDuration(elapsed, true);
    return (
      <span
        className="text-[28px] tracking-[-0.02em] leading-[1.2]"
        style={{
          fontFamily: "var(--font-dm-serif)",
          color: "var(--text-primary)",
        }}
      >
        {text}
      </span>
    );
  }

  const text = formatDuration(elapsed);
  return (
    <span
      className="text-sm font-mono font-bold"
      style={{ color: "var(--accent-text)" }}
    >
      {text}
    </span>
  );
}
