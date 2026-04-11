"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { calcNutrients } from "@/lib/nutrition-utils";
import type { NutritionEntry } from "@/lib/nutrition-utils";
import { useNutritionStore } from "@/store/nutritionStore";

// Un seul item swipé à la fois — singleton module-level
let closeCurrentlyOpen: (() => void) | null = null;

const REVEAL_THRESHOLD = 70;
const DELETE_THRESHOLD = 180;
const BUTTON_WIDTH = 90;

interface Props {
  entry: NutritionEntry;
  onFoodClick: (entry: NutritionEntry) => void;
}

export default function SwipeableFoodItem({ entry, onFoodClick }: Props) {
  const removeEntry = useNutritionStore((s) => s.removeEntry);

  const [x, setX] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [removing, setRemoving] = useState(false);

  const xRef = useRef(0);
  const slidingRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dirLocked = useRef<"h" | "v" | null>(null);
  const didDrag = useRef(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    xRef.current = 0;
    setSnapping(true);
    setX(0);
  }, []);

  // Nettoyage du singleton + timer au démontage
  useEffect(() => {
    return () => {
      if (closeCurrentlyOpen === close) closeCurrentlyOpen = null;
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, [close]);

  const doDelete = useCallback(() => {
    setSnapping(true);
    setRemoving(true);
    if (closeCurrentlyOpen === close) closeCurrentlyOpen = null;
    deleteTimerRef.current = setTimeout(() => removeEntry(entry.id), 280);
  }, [close, entry.id, removeEntry]);

  // Native listener passive:false pour que preventDefault fonctionne sur iOS
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
        didDrag.current = true;
        const newX = Math.max(-BUTTON_WIDTH, Math.min(0, dx));
        xRef.current = newX;
        setX(newX);
      }
    };

    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Ferme l'item précédemment ouvert
      if (closeCurrentlyOpen && closeCurrentlyOpen !== close) {
        closeCurrentlyOpen();
      }
      closeCurrentlyOpen = close;

      const t = e.touches[0];
      // Soustrait la position courante pour reprendre depuis l'offset actuel
      touchStart.current = { x: t.clientX - xRef.current, y: t.clientY };
      dragging.current = true;
      dirLocked.current = null;
      didDrag.current = false;
      setSnapping(false);
    },
    [close],
  );

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

  const handleClick = useCallback(() => {
    if (didDrag.current) return;
    if (xRef.current !== 0) {
      close();
      return;
    }
    onFoodClick(entry);
  }, [close, entry, onFoodClick]);

  const n = calcNutrients(entry.aliment, entry.quantite_g);
  const subtitle = [entry.aliment.marque, `${Math.round(entry.quantite_g)} g`]
    .filter(Boolean)
    .join(", ");

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          visibility: x < 0 ? "visible" : "hidden",
        }}
      >
        <button
          onClick={doDelete}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Supprimer
        </button>
      </div>

      {/* Contenu glissant */}
      <div
        ref={slidingRef}
        style={{
          transform: `translate3d(${x}px, 0, 0)`,
          transition: snapping ? "transform 250ms ease" : "none",
          background: "#0C0E0E",
          position: "relative",
          zIndex: 1,
          willChange: "transform",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="w-full flex items-center justify-between py-3">
          <div className="min-w-0 flex-1">
            <div
              className="text-[15px] font-semibold truncate"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {entry.aliment.nom}
            </div>
            <div
              className="text-[13px] mt-0.5"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {subtitle}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <span
              className="text-[15px] font-semibold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {n.calories} kcal
            </span>
            <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
