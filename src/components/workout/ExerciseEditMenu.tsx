"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { MoreVertical, Settings, ArrowLeftRight, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function ExerciseEditMenu({
  isOpen,
  onToggle,
  onEdit,
  onReplace,
  onRemove,
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
        className="p-2 rounded-lg active:opacity-60 transition-opacity"
        style={{ color: "var(--text-secondary)" }}
      >
        <MoreVertical size={18} />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[70]" onClick={onClose} />
            <div
              className="fixed z-[70] w-56 rounded-2xl overflow-hidden shadow-xl"
              style={{
                top: pos.top,
                right: pos.right,
                background: "#151312",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                onClick={onEdit}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-60 transition-opacity"
              >
                <Settings size={16} style={{ color: "#1E9D4C" }} />
                <span
                  className="text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Modifier les informations
                </span>
              </button>
              <div
                className="mx-4 h-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <button
                onClick={onReplace}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-60 transition-opacity"
              >
                <ArrowLeftRight size={16} style={{ color: "#1E9D4C" }} />
                <span
                  className="text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Changer l&apos;exercice
                </span>
              </button>
              <div
                className="mx-4 h-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <button
                onClick={onRemove}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-60 transition-opacity"
              >
                <Trash2 size={16} style={{ color: "#EF4444" }} />
                <span className="text-[15px]" style={{ color: "#EF4444" }}>
                  Retirer l&apos;exercice
                </span>
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
