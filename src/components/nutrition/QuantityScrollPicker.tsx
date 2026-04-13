"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  compact?: boolean;
  visible?: number;
  itemHeight?: number;
  hideHighlight?: boolean;
  bgColor?: string;
  gradientHeight?: number;
  onCenterTap?: () => void;
  editing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  onEditConfirm?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function QuantityScrollPicker({
  value,
  onChange,
  min = 1,
  max = 2000,
  step = 1,
  suffix,
  compact,
  visible: visibleProp,
  itemHeight: itemHeightProp,
  hideHighlight,
  bgColor,
  gradientHeight,
  onCenterTap,
  editing,
  editValue,
  onEditChange,
  onEditConfirm,
  inputRef,
}: Props) {
  const ITEM_H = itemHeightProp ?? (compact ? 46 : 52);
  const VISIBLE = visibleProp ?? (compact ? 3 : 5);
  const half = Math.floor(VISIBLE / 2);

  const touchRef = useRef<{
    startY: number;
    startVal: number;
    moved: boolean;
    startTime: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Ref stable pour onChange — évite de ré-enregistrer le listener à chaque render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const clamp = useCallback(
    (v: number) => {
      const rounded = Math.round(v / step) * step;
      const fixed = Math.round(rounded * 10) / 10;
      return Math.min(max, Math.max(min, fixed));
    },
    [step, min, max],
  );

  // Listener natif non-passif pour bloquer le scroll de la page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleTouchMove(e: TouchEvent) {
      if (!touchRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const dy = e.touches[0].clientY - touchRef.current.startY;
      if (Math.abs(dy) > 8) touchRef.current.moved = true;
      const ITEM = compact ? 46 : 52;
      setDragOffset(
        ((dy % ITEM) + ITEM) % ITEM > ITEM / 2 ? (dy % ITEM) - ITEM : dy % ITEM,
      );
      const steps = -Math.round(dy / ITEM);
      const newVal = clamp(touchRef.current.startVal + steps * step);
      if (newVal !== valueRef.current) onChangeRef.current(newVal);
    }

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [clamp, step, compact]);

  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = {
      startY: e.touches[0].clientY,
      startVal: value,
      moved: false,
      startTime: Date.now(),
    };
    setDragOffset(0);
    setDragging(true);
  }

  function onTouchEnd() {
    if (!touchRef.current) return;
    const wasDrag = touchRef.current.moved;
    const elapsed = Date.now() - touchRef.current.startTime;
    touchRef.current = null;
    setDragOffset(0);
    setDragging(false);
    // Tap court sans mouvement → édition clavier (géré par onClick sur l'élément central)
    if (!wasDrag && elapsed < 300 && onCenterTap) {
      onCenterTap();
    }
  }

  // Auto-focus l'input quand on passe en mode édition
  useEffect(() => {
    if (editing && inputRef?.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [editing, inputRef]);

  const indices = Array.from({ length: VISIBLE }, (_, i) => i - half);

  return (
    <div
      ref={containerRef}
      style={{
        height: ITEM_H * VISIBLE,
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        perspective: `${ITEM_H * VISIBLE * 1.2}px`,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Centre highlight */}
      {!hideHighlight && (
        <div
          style={{
            position: "absolute",
            top: ITEM_H * half,
            height: ITEM_H,
            left: 8,
            right: 8,
            background: "var(--accent-bg)",
            borderRadius: 14,
            border:
              "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            zIndex: 0,
            boxShadow:
              "0 0 12px color-mix(in srgb, var(--accent) 10%, transparent)",
          }}
        />
      )}
      {/* Gradient haut */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: gradientHeight ?? ITEM_H * half,
          background: `linear-gradient(to bottom, ${bgColor ?? "var(--bg-secondary)"} 10%, transparent)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {/* Gradient bas */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: gradientHeight ?? ITEM_H * half,
          background: `linear-gradient(to top, ${bgColor ?? "var(--bg-secondary)"} 10%, transparent)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {/* Items */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${dragOffset}px)`,
          transition: dragging ? "none" : "transform 0.12s ease-out",
          zIndex: 1,
        }}
      >
        {indices.map((i) => {
          const raw = value + i * step;
          const v = clamp(raw);
          const outOfRange = raw < min || raw > max;
          const isCenter = i === 0;
          const dist = Math.abs(i);
          return (
            <div
              key={i}
              style={{
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: `rotateX(${i * 12}deg)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                {isCenter && editing ? (
                  <>
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="decimal"
                      value={editValue ?? ""}
                      onChange={(e) => onEditChange?.(e.target.value)}
                      onBlur={() => onEditConfirm?.()}
                      onKeyDown={(e) => e.key === "Enter" && onEditConfirm?.()}
                      style={{
                        fontSize: compact ? 26 : 30,
                        fontWeight: 800,
                        color: "var(--accent-text)",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        width: "4ch",
                        lineHeight: 1,
                        fontFamily: "inherit",
                        caretColor: "var(--accent)",
                      }}
                    />
                    {suffix && (
                      <span
                        style={{
                          fontSize: compact ? 11 : 14,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          opacity: 0.8,
                        }}
                      >
                        {suffix}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: compact ? 18 : 17,
                        fontWeight: isCenter ? 700 : 400,
                        color: isCenter ? "#C2C2C3" : "var(--text-secondary)",
                        opacity:
                          outOfRange && !isCenter
                            ? 0
                            : isCenter
                              ? 1
                              : dist === 1
                                ? 0.6
                                : 0.25,
                        transition: "font-size 0.1s, opacity 0.1s",
                        lineHeight: 1,
                      }}
                    >
                      {outOfRange && !isCenter ? "" : v}
                    </span>
                    {isCenter && suffix && (
                      <span
                        style={{
                          fontSize: compact ? 11 : 14,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          opacity: 0.8,
                        }}
                      >
                        {suffix}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
