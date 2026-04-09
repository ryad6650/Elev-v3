"use client";

import { useTransition } from "react";
import { deletePoids } from "@/app/actions/poids";
import type { PoidsEntry } from "@/lib/poids";

interface Props {
  entries: PoidsEntry[];
  onEdit: (entry: PoidsEntry) => void;
  onDeleted?: (id: string) => void;
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function HistoriqueRow({
  entry,
  delta,
  onEdit,
  onDeleted,
}: {
  entry: PoidsEntry;
  delta: number | null;
  onEdit: () => void;
  onDeleted?: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleLongPress = () => {
    const action = confirm("Supprimer cette entrée ?");
    if (!action) {
      onEdit();
      return;
    }
    startTransition(async () => {
      await deletePoids(entry.id);
      onDeleted?.(entry.id);
    });
  };

  void handleLongPress;

  const deltaColor =
    delta === null || delta === 0
      ? "var(--text-muted)"
      : delta < 0
        ? "var(--green)"
        : "#c94444";

  const deltaText =
    delta === null
      ? "—"
      : delta === 0
        ? "0.0"
        : delta < 0
          ? `−${Math.abs(delta).toFixed(1)}`
          : `+${delta.toFixed(1)}`;

  return (
    <div
      onClick={onEdit}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        opacity: isPending ? 0.4 : 1,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 12,
          color: "var(--text-muted)",
          width: 60,
          flexShrink: 0,
        }}
      >
        {formatDateShort(entry.date)}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {entry.poids} kg
      </span>
      <span
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: deltaColor,
        }}
      >
        {deltaText}
      </span>
    </div>
  );
}

export default function PoidsHistorique({ entries, onEdit, onDeleted }: Props) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        Historique
      </div>
      {recent.map((entry, i) => {
        const next = sorted[i + 1];
        const delta = next
          ? Math.round((entry.poids - next.poids) * 10) / 10
          : null;
        return (
          <HistoriqueRow
            key={entry.id}
            entry={entry}
            delta={delta}
            onEdit={() => onEdit(entry)}
            onDeleted={onDeleted}
          />
        );
      })}
    </div>
  );
}
