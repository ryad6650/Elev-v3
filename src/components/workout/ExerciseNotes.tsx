"use client";

import { memo, useState, useRef, useCallback } from "react";
import { PenLine } from "lucide-react";

interface ButtonProps {
  note: string;
  isOpen: boolean;
  onToggle: () => void;
  hasInitialNote: boolean;
}

function ExerciseNotesButton({
  note,
  isOpen,
  onToggle,
  hasInitialNote,
}: ButtonProps) {
  const [hasBlinked, setHasBlinked] = useState(false);
  const shouldBlink = hasInitialNote && !hasBlinked && !isOpen;

  const handleClick = useCallback(() => {
    if (!isOpen) setHasBlinked(true);
    onToggle();
  }, [isOpen, onToggle]);

  const hasContent = !!note || isOpen;
  return (
    <button
      onClick={handleClick}
      className="text-[8px] font-bold tracking-[0.03em] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-opacity active:opacity-70"
      style={{
        background: "rgba(74,55,40,0.06)",
        color: hasContent ? "var(--bar-to)" : "var(--text-muted)",
      }}
    >
      <PenLine
        size={10}
        className={shouldBlink ? "animate-pulse" : ""}
        style={shouldBlink ? { color: "var(--bar-to)" } : undefined}
      />
      <span className={shouldBlink ? "animate-pulse" : ""}>
        Notes
        {shouldBlink && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full ml-1 align-middle"
            style={{ background: "var(--bar-to)" }}
          />
        )}
      </span>
    </button>
  );
}

interface AreaProps {
  note: string;
  onChange: (note: string) => void;
}

function ExerciseNotesArea({ note, onChange }: AreaProps) {
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleBlur = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed !== note) onChange(trimmed);
  }, [draft, note, onChange]);

  return (
    <div
      className="px-3.5 pb-3 pt-2"
      style={{ borderTop: "1px solid var(--glass-border)" }}
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder="Ex : prise large, forcer l'excentrique..."
        rows={2}
        className="w-full rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none placeholder:text-[var(--text-muted)]"
        style={{
          background: "var(--glass-subtle)",
          color: "var(--text-primary)",
          border: "1px solid var(--glass-border)",
        }}
        autoFocus
      />
    </div>
  );
}

const MemoButton = memo(ExerciseNotesButton);
const MemoArea = memo(ExerciseNotesArea);

export { MemoButton as ExerciseNotesButton, MemoArea as ExerciseNotesArea };
