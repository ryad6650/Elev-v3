"use client";

import { memo, useState, useCallback } from "react";
import { saveSommeil } from "@/app/actions/sommeil";

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  sommeilMinutes: number | null;
}

export default memo(function SleepCard({ sommeilMinutes }: Props) {
  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState(
    sommeilMinutes ? Math.floor(sommeilMinutes / 60) : 7,
  );
  const [mins, setMins] = useState(sommeilMinutes ? sommeilMinutes % 60 : 30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(sommeilMinutes);

  const handleSave = useCallback(async () => {
    const total = hours * 60 + mins;
    if (total < 1 || total > 720) return;
    setSaving(true);
    try {
      await saveSommeil(getTodayString(), total);
      setSaved(total);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [hours, mins]);

  if (editing) {
    return (
      <div
        className="flex-1 rounded-[16px] p-3.5 flex flex-col items-center gap-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(116,191,122,0.25)",
          minHeight: 90,
        }}
      >
        <span className="text-[16px]">😴</span>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(hours)}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setHours(Math.max(0, Math.min(12, v)));
              else if (e.target.value === "") setHours(0);
            }}
            className="w-[40px] h-[32px] text-center text-[16px] font-bold rounded-lg outline-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FAFAF9",
              padding: "0",
              lineHeight: "32px",
            }}
          />
          <span
            className="text-[12px] font-semibold"
            style={{ color: "#FAFAF9" }}
          >
            h
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(mins).padStart(2, "0")}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setMins(Math.max(0, Math.min(59, v)));
              else if (e.target.value === "") setMins(0);
            }}
            className="w-[40px] h-[32px] text-center text-[16px] font-bold rounded-lg outline-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FAFAF9",
              padding: "0",
              lineHeight: "32px",
            }}
          />
          <span
            className="text-[12px] font-semibold"
            style={{ color: "#FAFAF9" }}
          >
            m
          </span>
        </div>
        <div className="flex gap-1.5 w-full">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg active:scale-95 transition-transform"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "var(--text-muted)",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg active:scale-95 transition-transform"
            style={{
              background: "#0d1f2d",
              color: "#1E9D4C",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "..." : "OK"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex-1 rounded-[16px] py-5 px-3.5 flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 110,
      }}
    >
      <span className="text-[20px]">😴</span>
      {saved != null ? (
        <>
          <span
            className="text-[28px] font-bold leading-none"
            style={{ color: "#1E9D4C" }}
          >
            {formatSleep(saved)}
          </span>
          <span
            className="text-[10px] font-semibold tracking-[0.04em]"
            style={{ color: "var(--text-muted)" }}
          >
            sommeil
          </span>
        </>
      ) : (
        <>
          <span
            className="text-[15px] font-bold leading-none"
            style={{ color: "var(--text-secondary)" }}
          >
            + Sommeil
          </span>
          <span
            className="text-[10px] font-semibold tracking-[0.04em]"
            style={{ color: "var(--text-muted)" }}
          >
            ajouter
          </span>
        </>
      )}
    </button>
  );
});
