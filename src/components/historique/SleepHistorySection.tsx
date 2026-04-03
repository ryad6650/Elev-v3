"use client";

import { useMemo, useState } from "react";
import { Moon, Trash2 } from "lucide-react";
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
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const d = new Date(dateStr + "T12:00:00");
  const label = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  if (dateStr === today) return `Auj. · ${label}`;
  if (dateStr === yesterday) return `Hier · ${label}`;
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function qualiteLabel(minutes: number): { text: string; color: string } {
  if (minutes >= 420) return { text: "Excellent", color: "var(--success)" };
  if (minutes >= 360) return { text: "Bon", color: "var(--accent-text)" };
  if (minutes >= 300) return { text: "Moyen", color: "#F5A623" };
  return { text: "Insuffisant", color: "var(--danger)" };
}

export default function SleepHistorySection({ sommeil, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (sommeil.length === 0) return null;
    const total = sommeil.reduce((s, e) => s + e.duree_minutes, 0);
    const avg = Math.round(total / sommeil.length);
    const best = Math.max(...sommeil.map((e) => e.duree_minutes));
    return { avg, best, count: sommeil.length };
  }, [sommeil]);

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

  // Barre visuelle : max = 12h (720min)
  const barMax = 720;

  return (
    <div className="mb-3">
      <div
        className="font-semibold uppercase mb-2.5"
        style={{
          fontSize: "0.7rem",
          color: "var(--text-secondary)",
          letterSpacing: "0.07em",
        }}
      >
        Sommeil
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="flex gap-2 mb-3">
          <div
            className="flex-1 relative overflow-hidden rounded-[18px] p-3"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: 3,
                borderRadius: "0 2px 2px 0",
                background: "#8B5CF6",
              }}
            />
            <div
              className="font-bold leading-snug"
              style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}
            >
              {formatDuree(stats.avg)}
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              moyenne
            </div>
          </div>
          <div
            className="flex-1 relative overflow-hidden rounded-[18px] p-3"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: 3,
                borderRadius: "0 2px 2px 0",
                background: "var(--success)",
              }}
            />
            <div
              className="font-bold leading-snug"
              style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}
            >
              {formatDuree(stats.best)}
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              meilleure nuit
            </div>
          </div>
          <div
            className="flex-1 relative overflow-hidden rounded-[18px] p-3"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: 3,
                borderRadius: "0 2px 2px 0",
                background: "#5B9BF5",
              }}
            />
            <div
              className="font-bold leading-snug"
              style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}
            >
              🌙 {stats.count}
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              nuits suivies
            </div>
          </div>
        </div>
      )}

      {sommeil.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🌙</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune donnée de sommeil
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Enregistre ton sommeil depuis le dashboard
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sommeil.map((record) => {
            const qualite = qualiteLabel(record.duree_minutes);
            const pct = Math.min((record.duree_minutes / barMax) * 100, 100);
            return (
              <div
                key={record.id}
                className="relative overflow-hidden rounded-[18px] p-3.5"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: 3,
                    borderRadius: "0 2px 2px 0",
                    background: "#8B5CF6",
                  }}
                />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon size={14} style={{ color: "#8B5CF6" }} />
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatDuree(record.duree_minutes)}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{
                        fontSize: "0.6rem",
                        background: "var(--bg-card)",
                        color: qualite.color,
                      }}
                    >
                      {qualite.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatDate(record.date)}
                    </span>
                    <button
                      onClick={() => handleDelete(record)}
                      className="p-1.5 rounded-lg transition-all active:scale-90"
                      style={{
                        background:
                          deletingId === record.id
                            ? "rgba(239,68,68,0.15)"
                            : "transparent",
                      }}
                    >
                      <Trash2
                        size={13}
                        style={{
                          color:
                            deletingId === record.id
                              ? "var(--danger)"
                              : "var(--text-muted)",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Barre de durée */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #8B5CF6, #A78BFA)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
