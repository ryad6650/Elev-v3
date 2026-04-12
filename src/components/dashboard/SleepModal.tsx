"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { X } from "lucide-react";
import { saveSommeil } from "@/app/actions/sommeil";

interface Props {
  date: string;
  initialMinutes: number | null;
  onClose: () => void;
  onSaved: (minutes: number) => void;
}

const ITEM_HEIGHT = 48;
const VISIBLE = 5;

interface ScrollPickerProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  label: string;
}

function ScrollPicker({
  items,
  selectedIndex,
  onChange,
  label,
}: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartIndex = useRef(selectedIndex);
  const isDragging = useRef(false);
  const currentOffset = useRef(selectedIndex * ITEM_HEIGHT);

  const clamp = (v: number) => Math.max(0, Math.min(items.length - 1, v));

  const scrollTo = useCallback((index: number, animated = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transition = animated
      ? "transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      : "none";
    el.style.transform = `translateY(${-index * ITEM_HEIGHT}px)`;
    currentOffset.current = index * ITEM_HEIGHT;
  }, []);

  useEffect(() => {
    scrollTo(selectedIndex, false);
  }, [selectedIndex, scrollTo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    touchStartY.current = e.touches[0].clientY;
    touchStartIndex.current = selectedIndex;
    currentOffset.current = selectedIndex * ITEM_HEIGHT;
    const el = containerRef.current;
    if (el) el.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dy = touchStartY.current - e.touches[0].clientY;
    const rawOffset = touchStartIndex.current * ITEM_HEIGHT + dy;
    const maxOffset = (items.length - 1) * ITEM_HEIGHT;
    let offset = rawOffset;
    if (rawOffset < 0) offset = rawOffset * 0.25;
    if (rawOffset > maxOffset)
      offset = maxOffset + (rawOffset - maxOffset) * 0.25;
    const el = containerRef.current;
    if (el) el.style.transform = `translateY(${-offset}px)`;
    currentOffset.current = offset;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    const nearest = clamp(Math.round(currentOffset.current / ITEM_HEIGHT));
    onChange(nearest);
    scrollTo(nearest);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = clamp(selectedIndex + (e.deltaY > 0 ? 1 : -1));
    onChange(next);
    scrollTo(next);
  };

  const topPad = Math.floor(VISIBLE / 2) * ITEM_HEIGHT;
  const containerHeight = VISIBLE * ITEM_HEIGHT;

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>

      <div
        className="relative overflow-hidden select-none"
        style={{ height: containerHeight, width: 72, touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Lignes de sélection */}
        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: topPad,
            height: ITEM_HEIGHT,
            borderTop: "1.5px solid #1E9D4C",
            borderBottom: "1.5px solid #1E9D4C",
          }}
        />

        {/* Dégradés */}
        <div
          className="absolute inset-x-0 top-0 z-10 pointer-events-none"
          style={{
            height: topPad,
            background: "linear-gradient(to bottom, #1B1715, transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: topPad,
            background: "linear-gradient(to top, #1B1715, transparent)",
          }}
        />

        {/* Items */}
        <div
          ref={containerRef}
          className="absolute inset-x-0"
          style={{ top: topPad }}
        >
          {items.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={i}
                className="flex items-center justify-center font-bold"
                style={{
                  height: ITEM_HEIGHT,
                  fontSize: isSelected ? 30 : 20,
                  color: isSelected ? "#74BF7A" : "var(--text-muted)",
                  transition: "font-size 150ms, color 150ms",
                  cursor: "pointer",
                }}
                onClick={() => {
                  onChange(i);
                  scrollTo(i);
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const HEURES_ITEMS = Array.from({ length: 13 }, (_, i) => String(i));
const MINUTES_ITEMS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export default function SleepModal({
  date,
  initialMinutes,
  onClose,
  onSaved,
}: Props) {
  const initH = initialMinutes != null ? Math.floor(initialMinutes / 60) : 7;
  const initM = initialMinutes != null ? initialMinutes % 60 : 30;

  const [heuresIdx, setHeuresIdx] = useState(initH);
  const [minutesIdx, setMinutesIdx] = useState(initM);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const totalMinutes = heuresIdx * 60 + minutesIdx;

  const handleSave = () => {
    if (totalMinutes === 0) {
      setError("Durée invalide");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await saveSommeil(date, totalMinutes);
        onSaved(totalMinutes);
        onClose();
      } catch {
        setError("Erreur lors de la sauvegarde");
      }
    });
  };

  return (
    <>
      {/* Fond semi-transparent */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", touchAction: "none" }}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Card flottante au-dessus de la bottom nav */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[min(92vw,400px)]"
        style={{ bottom: 104 }}
      >
        <div
          className="rounded-3xl p-5"
          style={{
            background: "#1B1715",
            border: "1px solid var(--border)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between mb-1">
            <h2
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-lora), serif",
                fontStyle: "italic",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Sommeil de la nuit
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full"
              style={{ background: "rgba(116,191,122,0.15)" }}
            >
              <X size={16} style={{ color: "#74BF7A" }} />
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Durée totale dormie
          </p>

          {/* Pickers */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <ScrollPicker
              label="Heures"
              items={HEURES_ITEMS}
              selectedIndex={heuresIdx}
              onChange={setHeuresIdx}
            />
            <span
              className="text-2xl font-bold mt-5"
              style={{ color: "var(--text-secondary)" }}
            >
              h
            </span>
            <ScrollPicker
              label="Minutes"
              items={MINUTES_ITEMS}
              selectedIndex={minutesIdx}
              onChange={setMinutesIdx}
            />
          </div>

          {error && (
            <p
              className="text-xs mb-3 text-center"
              style={{ color: "var(--danger)" }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || totalMinutes === 0}
            className="w-full py-[15px] rounded-full text-[16px] font-bold active:scale-[0.98] transition-transform"
            style={{
              background:
                isPending || totalMinutes === 0
                  ? "var(--bg-elevated)"
                  : "#74BF7A",
              color:
                isPending || totalMinutes === 0
                  ? "var(--text-muted)"
                  : "#ffffff",
              opacity: isPending ? 0.6 : 1,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isPending ? "Sauvegarde…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </>
  );
}
