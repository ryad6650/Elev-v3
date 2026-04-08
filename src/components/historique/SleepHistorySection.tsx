"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { SommeilRecord } from "@/lib/historique";
import { deleteSommeil } from "@/app/actions/sommeil";

interface Props {
  sommeil: SommeilRecord[];
  onDeleted: (id: string) => void;
}

function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function SleepHistorySection({ sommeil, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const avgMinutes = useMemo(() => {
    if (sommeil.length === 0) return 0;
    const total = sommeil.reduce((s, e) => s + e.duree_minutes, 0);
    return Math.round(total / sommeil.length);
  }, [sommeil]);

  const barMax = 720;
  const avgPct = Math.min((avgMinutes / barMax) * 100, 100);

  const handleDelete = async (record: SommeilRecord) => {
    if (deletingId === record.id) {
      try {
        await deleteSommeil(record.date);
        onDeleted(record.id);
      } catch {
        /* silencieux */
      }
      setDeletingId(null);
    } else {
      setDeletingId(record.id);
    }
  };

  if (sommeil.length === 0) {
    return (
      <div className="mb-2.5">
        <SectionLabel />
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🌙</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune donnée de sommeil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2.5">
      <SectionLabel />
      <div
        className="rounded-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          padding: "14px 16px",
        }}
      >
        {sommeil.map((record) => (
          <div
            key={record.id}
            className="flex items-center gap-2.5"
            style={{
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {/* Icône violet */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(138,116,220,0.12)",
                fontSize: "14px",
              }}
            >
              🌙
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-medium capitalize"
                style={{ fontSize: "12px", color: "var(--text-primary)" }}
              >
                {formatDate(record.date)}
              </div>
            </div>
            <div
              className="font-bold shrink-0"
              style={{ fontSize: "15px", color: "var(--text-primary)" }}
            >
              {formatDuree(record.duree_minutes)}
            </div>
            <button
              onClick={() => handleDelete(record)}
              className="p-1 rounded-lg transition-all active:scale-90 shrink-0"
              style={{
                background:
                  deletingId === record.id
                    ? "rgba(239,68,68,0.15)"
                    : "transparent",
              }}
            >
              <Trash2
                size={12}
                style={{
                  color:
                    deletingId === record.id
                      ? "var(--danger)"
                      : "var(--text-muted)",
                }}
              />
            </button>
          </div>
        ))}

        {/* Barre globale */}
        <div
          className="overflow-hidden mt-2"
          style={{
            height: 4,
            background: "var(--bg-elevated)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${avgPct}%`,
              borderRadius: 2,
              background: "linear-gradient(to right, #6B5CA5, #8A74DC)",
            }}
          />
        </div>

        {/* Moyenne */}
        <div
          className="flex items-center justify-between mt-2.5 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Moyenne 7 jours
          </span>
          <span
            className="font-bold"
            style={{ fontSize: "12px", color: "#8A74DC" }}
          >
            {formatDuree(avgMinutes)} / nuit
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div
      className="font-bold uppercase mb-2"
      style={{
        fontSize: "9px",
        color: "var(--text-muted)",
        letterSpacing: "0.22em",
        padding: "2px 2px 0",
      }}
    >
      Sommeil
    </div>
  );
}
