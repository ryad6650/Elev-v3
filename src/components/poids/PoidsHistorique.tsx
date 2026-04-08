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

  const deltaColor =
    delta === null || delta === 0
      ? "var(--text-secondary)"
      : delta < 0
        ? "#74bf7a"
        : "#E87C6A";

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
        padding: "7px 0",
        borderBottom: "1px solid rgba(74,55,40,0.05)",
        opacity: isPending ? 0.4 : 1,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          width: 55,
          flexShrink: 0,
        }}
      >
        {formatDateShort(entry.date)}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {entry.poids} kg
      </span>
      <span
        style={{
          fontSize: 10,
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
    <div style={{ padding: "14px 0" }}>
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        Historique récent
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
