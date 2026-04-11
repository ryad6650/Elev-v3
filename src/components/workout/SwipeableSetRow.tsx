"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";
import SetRow from "./SetRow";
import type { WorkoutSet } from "@/store/workoutStore";

interface Props {
  set: WorkoutSet;
  isActive: boolean;
  index: number;
  onUpdate: (
    setId: string,
    field: "reps" | "poids",
    value: number | null,
  ) => void;
  onToggle: (set: WorkoutSet) => void;
  onRemove: (setId: string) => void;
}

const REVEAL_THRESHOLD = 80;
const DELETE_THRESHOLD = 200;
const BUTTON_WIDTH = 120;

export default function SwipeableSetRow({
  set,
  isActive,
  index,
  onUpdate,
  onToggle,
  onRemove,
}: Props) {
  const [x, setX] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [removing, setRemoving] = useState(false);

  const xRef = useRef(0);
  const slidingRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dirLocked = useRef<"h" | "v" | null>(null);

  const doDelete = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setSnapping(true);
    setRemoving(true);
    setTimeout(() => onRemove(set.id), 280);
  }, [set.id, onRemove]);

  // Native touchmove listener avec passive:false pour que preventDefault fonctionne sur iOS
  useEffect(() => {
    const el = slidingRef.current;
    if (!el) return;

    const handler = (e: TouchEvent) => {
      if (!dragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;

      if (!dirLocked.current) {
        if (Math.abs(dx) > Math.abs(dy) + 5) {
          dirLocked.current = "h";
        } else if (Math.abs(dy) > Math.abs(dx) + 5) {
          dragging.current = false;
          return;
        } else {
          return;
        }
      }

      if (dirLocked.current === "h") {
        e.preventDefault();
        // Swipe gauche seulement (dx négatif), max révélation = BUTTON_WIDTH
        const newX = Math.max(-BUTTON_WIDTH, Math.min(0, dx));
        xRef.current = newX;
        setX(newX);
      }
    };

    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX - xRef.current, y: t.clientY };
    dragging.current = true;
    dirLocked.current = null;
    setSnapping(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setSnapping(true);

    const cur = xRef.current;
    if (cur <= -DELETE_THRESHOLD) {
      doDelete();
    } else if (cur <= -REVEAL_THRESHOLD) {
      xRef.current = -BUTTON_WIDTH;
      setX(-BUTTON_WIDTH);
    } else {
      xRef.current = 0;
      setX(0);
    }
  }, [doDelete]);

  // Fond solide pour couvrir le bouton supprimer quand non swipé
  const rowBg = index % 2 === 1 ? "#151312" : "#000";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        maxHeight: removing ? 0 : 200,
        opacity: removing ? 0 : 1,
        transition: removing
          ? "max-height 280ms ease, opacity 240ms ease"
          : undefined,
      }}
    >
      {/* Bouton Supprimer — révélé par le swipe */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: BUTTON_WIDTH,
          background: "#EF4444",
          visibility: x < 0 ? "visible" : "hidden",
        }}
      >
        <button
          onClick={doDelete}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Trash2 size={18} color="#fff" />
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Supprimer
          </span>
        </button>
      </div>

      {/* Ligne qui glisse */}
      <div
        ref={slidingRef}
        style={{
          transform: `translateX(${x}px)`,
          transition: snapping ? "transform 250ms ease" : "none",
          background: rowBg,
          position: "relative",
          zIndex: 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SetRow
          set={set}
          isActive={isActive}
          index={index}
          onUpdate={onUpdate}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}
