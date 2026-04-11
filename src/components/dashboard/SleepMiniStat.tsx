"use client";

import { useState } from "react";
import SleepModal from "./SleepModal";

interface Props {
  initialMinutes: number | null;
}

function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export default function SleepMiniStat({ initialMinutes }: Props) {
  const [minutes, setMinutes] = useState<number | null>(initialMinutes);
  const [open, setOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center p-4 rounded-2xl border gap-1 w-full transition-all active:scale-95 card-surface"
        style={{ borderColor: minutes ? "#1E9D4C" : "var(--border)" }}
      >
        <span className="text-2xl">😴</span>
        <span
          className="text-lg font-bold"
          style={{
            color: minutes ? "#74BF7A" : "var(--text-primary)",
          }}
        >
          {minutes != null ? formatDuree(minutes) : "—"}
        </span>
        <span
          className="text-[10px] text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Sommeil
        </span>
      </button>

      {open && (
        <SleepModal
          date={today}
          initialMinutes={minutes}
          onClose={() => setOpen(false)}
          onSaved={(m) => setMinutes(m)}
        />
      )}
    </>
  );
}
