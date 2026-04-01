'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  compact?: boolean;
}

export default function QuantityScrollPicker({
  value, onChange, min = 1, max = 2000, step = 1, suffix, compact,
}: Props) {
  const ITEM_H = compact ? 46 : 52;
  const VISIBLE = compact ? 3 : 5;
  const half = Math.floor(VISIBLE / 2);

  const touchRef = useRef<{ startY: number; startVal: number; moved: boolean } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const clamp = (v: number) => {
    const rounded = Math.round(v / step) * step;
    const fixed = Math.round(rounded * 10) / 10;
    return Math.min(max, Math.max(min, fixed));
  };

  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { startY: e.touches[0].clientY, startVal: value, moved: false };
    setDragOffset(0);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!touchRef.current) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - touchRef.current.startY;
    if (Math.abs(dy) > 4) touchRef.current.moved = true;
    setDragOffset(((dy % ITEM_H) + ITEM_H) % ITEM_H > ITEM_H / 2
      ? (dy % ITEM_H) - ITEM_H
      : dy % ITEM_H);
    const steps = -Math.round(dy / ITEM_H);
    const newVal = clamp(touchRef.current.startVal + steps * step);
    if (newVal !== value) onChange(newVal);
  }

  function onTouchEnd() {
    touchRef.current = null;
    setDragOffset(0);
  }

  useEffect(() => { setDragOffset(0); }, [value]);

  const indices = Array.from({ length: VISIBLE }, (_, i) => i - half);

  return (
    <div
      style={{ height: ITEM_H * VISIBLE, overflow: 'hidden', position: 'relative', touchAction: 'none', userSelect: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Centre highlight */}
      <div style={{
        position: 'absolute', top: ITEM_H * half, height: ITEM_H, left: 8, right: 8,
        background: 'var(--accent-bg)', borderRadius: 14,
        border: '1px solid rgba(232,134,12,0.35)', zIndex: 0,
        boxShadow: '0 0 12px rgba(232,134,12,0.1)',
      }} />
      {/* Gradient haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * half,
        background: 'linear-gradient(to bottom, var(--bg-secondary) 10%, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Gradient bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * half,
        background: 'linear-gradient(to top, var(--bg-secondary) 10%, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Items */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        transform: `translateY(${dragOffset}px)`,
        transition: touchRef.current ? 'none' : 'transform 0.12s ease-out',
        zIndex: 1,
      }}>
        {indices.map(i => {
          const v = clamp(value + i * step);
          const isCenter = i === 0;
          const dist = Math.abs(i);
          return (
            <div key={i} style={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{
                  fontSize: isCenter ? (compact ? 26 : 30) : dist === 1 ? (compact ? 19 : 22) : (compact ? 13 : 15),
                  fontWeight: isCenter ? 800 : dist === 1 ? 600 : 400,
                  color: isCenter ? 'var(--accent-text)' : 'var(--text-secondary)',
                  opacity: isCenter ? 1 : dist === 1 ? 0.6 : 0.25,
                  transition: 'font-size 0.1s, opacity 0.1s',
                  lineHeight: 1,
                }}>
                  {v}
                </span>
                {isCenter && suffix && (
                  <span style={{ fontSize: compact ? 11 : 14, fontWeight: 500, color: 'var(--text-muted)', opacity: 0.8 }}>
                    {suffix}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
