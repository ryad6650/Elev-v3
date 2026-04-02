"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Pencil, Settings, ArrowLeftRight } from "lucide-react";
import { createPortal } from "react-dom";

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
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (!isOpen || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
  }, [isOpen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className="p-1.5 rounded-lg"
        style={{ color: "var(--accent-text)" }}
      >
        <Pencil size={14} />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[70]" onClick={onClose} />
            <div
              className="fixed z-[70] w-56 rounded-xl py-1 shadow-lg"
              style={{
                top: pos.top,
                right: pos.right,
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
          </>,
          document.body,
        )}
    </>
  );
}
