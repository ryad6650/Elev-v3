"use client";

import { memo, useState, useRef, useCallback } from "react";
import { StickyNote } from "lucide-react";

interface Props {
  note: string;
  onChange: (note: string) => void;
  hasInitialNote: boolean;
}

function ExerciseNotes({ note, onChange, hasInitialNote }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const shouldBlink = hasInitialNote && !hasBlinked && !isOpen;

  const handleOpen = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setHasBlinked(true);
      return !prev;
    });
  }, []);

  const handleBlur = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed !== note) onChange(trimmed);
  }, [draft, note, onChange]);

  return (
    <div className="flex flex-col">
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-1.5 py-3 text-sm transition-opacity hover:opacity-70"
        style={{
          color: note
            ? "var(--accent)"
            : isOpen
              ? "var(--accent)"
              : "var(--text-muted)",
        }}
      >
        <StickyNote
          size={15}
          className={shouldBlink ? "animate-pulse" : ""}
          style={shouldBlink ? { color: "var(--accent)" } : undefined}
        />
        <span className={shouldBlink ? "animate-pulse" : ""}>
          Notes
          {shouldBlink && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full ml-1 align-middle"
              style={{ background: "var(--accent)" }}
            />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            placeholder="Ex : prise large, forcer l'excentrique..."
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none placeholder:text-[var(--text-muted)]"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export default memo(ExerciseNotes);
