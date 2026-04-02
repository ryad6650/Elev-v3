"use client";

import { Pencil, Settings, ArrowLeftRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onReplace: () => void;
  onClose: () => void;
}

export default function ExerciseEditMenu({
  isOpen,
  onToggle,
  onEdit,
  onReplace,
  onClose,
}: Props) {
  return (
    <>
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg"
        style={{ color: "var(--accent-text)" }}
      >
        <Pencil size={14} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={onClose} />
          <div
            className="absolute right-0 bottom-8 z-[70] w-56 rounded-xl py-1 shadow-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <Settings size={14} style={{ color: "var(--accent-text)" }} />
              Modifier les informations
            </button>
            <div
              className="mx-3 h-px"
              style={{ background: "var(--border)" }}
            />
            <button
              onClick={onReplace}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <ArrowLeftRight
                size={14}
                style={{ color: "var(--accent-text)" }}
              />
              Changer l&apos;exercice actuel
            </button>
          </div>
        </>
      )}
    </>
  );
}
