"use client";

import { useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { deletePoids } from "@/app/actions/poids";
import type { PoidsEntry } from "@/lib/poids";

interface Props {
  entries: PoidsEntry[];
  onEdit: (entry: PoidsEntry) => void;
  onDeleted?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HistoriqueRow({
  entry,
  onEdit,
  onDeleted,
}: {
  entry: PoidsEntry;
  onEdit: () => void;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer cette entrée ?")) return;
    startTransition(async () => {
      await deletePoids(entry.id);
      onDeleted?.();
    });
  };

  return (
    <div
      className="flex items-center justify-between py-3 transition-opacity"
      style={{
        borderBottom: "1px solid var(--border)",
        opacity: isPending ? 0.4 : 1,
      }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {formatDate(entry.date)}
      </span>

      <div className="flex items-center gap-3">
        <span
          className="text-base font-bold"
          style={{ color: "var(--accent-text)" }}
        >
          {entry.poids} kg
        </span>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg"
          style={{ background: "var(--bg-card)" }}
          aria-label="Modifier"
        >
          <Pencil size={14} style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-1.5 rounded-lg"
          style={{ background: "var(--bg-card)" }}
          aria-label="Supprimer"
        >
          <Trash2 size={14} style={{ color: "var(--danger)" }} />
        </button>
      </div>
    </div>
  );
}

export default function PoidsHistorique({ entries, onEdit, onDeleted }: Props) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        Historique
      </p>
      {sorted.map((entry) => (
        <HistoriqueRow
          key={entry.id}
          entry={entry}
          onEdit={() => onEdit(entry)}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
