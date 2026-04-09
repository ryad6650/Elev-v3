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
  const weekday =
    d.toLocaleDateString("fr-FR", { weekday: "long" }).charAt(0).toUpperCase() +
    d.toLocaleDateString("fr-FR", { weekday: "long" }).slice(1);
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "long" });
  return `${weekday} · ${day} ${month}`;
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
      <div className="mb-3">
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
      <SectionLabel />

      {sommeil.map((record) => (
        <div
          key={record.id}
          className="flex items-center gap-2.5"
          style={{
            padding: "10px 0",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(155,126,200,0.1)",
              fontSize: 15,
            }}
          >
            🌙
          </div>
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {formatDate(record.date)}
            </div>
          </div>
          <span
            className="shrink-0"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {formatDuree(record.duree_minutes)}
          </span>
          <button
            onClick={() => handleDelete(record)}
            className="p-1 rounded-lg transition-all active:scale-90 shrink-0"
            style={{
              background:
                deletingId === record.id
                  ? "rgba(201,68,68,0.12)"
                  : "transparent",
            }}
          >
            <Trash2
              size={14}
              style={{
                color:
                  deletingId === record.id ? "#c94444" : "var(--text-muted)",
              }}
            />
          </button>
        </div>
      ))}

      {/* Barre moyenne */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.04)",
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        <div
          className="overflow-hidden mb-1.5"
          style={{
            height: 5,
            borderRadius: 99,
            background: "rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${avgPct}%`,
              borderRadius: 99,
              background: "linear-gradient(90deg, #9B7EC8, #7B5EA8)",
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            Moyenne 7 jours
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
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
      style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: 12,
      }}
    >
      Sommeil
    </div>
  );
}
