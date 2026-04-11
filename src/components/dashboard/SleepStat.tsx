"use client";

import { memo, useState, useCallback } from "react";
import { saveSommeil } from "@/app/actions/sommeil";

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  sommeilMinutes: number | null;
}

export default memo(function SleepStat({ sommeilMinutes }: Props) {
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
        className="flex items-center gap-2"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--glass-border)",
          padding: 20,
        }}
      >
        <span style={{ fontSize: 24 }}>💤</span>
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
          className="w-8 text-center text-sm font-bold rounded outline-none"
          style={{
            background: "rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "var(--text-primary)",
            padding: "2px 0",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
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
          className="w-8 text-center text-sm font-bold rounded outline-none"
          style={{
            background: "rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "var(--text-primary)",
            padding: "2px 0",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-semibold px-2 py-1 rounded active:scale-95"
          style={{
            background: "#74BF7A",
            color: "white",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "..." : "OK"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs px-1"
          style={{ color: "var(--text-muted)" }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex-1 text-center active:opacity-70 transition-opacity"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>💤</div>
      {saved != null ? (
        <>
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontStyle: "italic",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {formatSleep(saved)}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            sommeil
          </div>
        </>
      ) : (
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          + Ajouter sommeil
        </div>
      )}
    </button>
  );
});
