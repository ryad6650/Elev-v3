"use client";

import { useState } from "react";
import { MoreVertical, ArrowLeftRight, Trash2 } from "lucide-react";

interface Props {
  onReplace: () => void;
  onDelete: () => void;
}

export default function ExerciseMenu({ onReplace, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg transition-opacity active:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1 z-[60] w-52 rounded-xl py-1 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onReplace();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold transition-opacity active:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              <ArrowLeftRight size={14} style={{ color: "var(--green)" }} />
              Remplacer l&apos;exercice
            </button>
            <div
              className="mx-3 h-px"
              style={{ background: "rgba(0,0,0,0.06)" }}
            />
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold transition-opacity active:opacity-70"
              style={{ color: "#c94444" }}
            >
              <Trash2 size={14} />
              Supprimer l&apos;exercice
            </button>
          </div>
        </>
      )}
    </div>
  );
}
