'use client';

import { useRef, useState, useEffect } from 'react';

const ITEM_H = 52;
const VISIBLE = 5;

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export default function QuantityScrollPicker({
  value, onChange, min = 1, max = 2000, step = 1, suffix,
}: Props) {
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const touchRef = useRef<{ startY: number; startVal: number; moved: boolean } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Visual drag: fraction of an item height
    setDragOffset(((dy % ITEM_H) + ITEM_H) % ITEM_H > ITEM_H / 2
      ? (dy % ITEM_H) - ITEM_H
      : dy % ITEM_H);
    // Discrete value: drag down = decrease, drag up = increase
    const steps = -Math.round(dy / ITEM_H);
    const newVal = clamp(touchRef.current.startVal + steps * step);
    if (newVal !== value) onChange(newVal);
  }

  function onTouchEnd() {
    if (touchRef.current && !touchRef.current.moved) {
      // It was a tap — handled by onClick
    }
    touchRef.current = null;
    setDragOffset(0);
  }

  function handleCenterClick() {
    if (touchRef.current?.moved) return;
    setShowInput(true);
    setInputVal(String(value));
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
  }

  function confirmInput() {
    const n = parseFloat(inputVal.replace(',', '.'));
    if (!isNaN(n)) onChange(clamp(n));
    setShowInput(false);
  }

  // Sync scroll when value changes from outside (e.g. mode switch)
  useEffect(() => { setDragOffset(0); }, [value]);

  const indices = [-2, -1, 0, 1, 2] as const;

  return (
    <div
      ref={containerRef}
      style={{ height: ITEM_H * VISIBLE, overflow: 'hidden', position: 'relative', touchAction: 'none', userSelect: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Center highlight */}
      <div style={{
        position: 'absolute', top: ITEM_H * 2, height: ITEM_H, left: 20, right: 20,
        background: 'var(--accent-bg)', borderRadius: 16,
        border: '1px solid rgba(232,134,12,0.35)', zIndex: 0,
        boxShadow: '0 0 12px rgba(232,134,12,0.1)',
      }} />

      {/* Gradient mask top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: 'linear-gradient(to bottom, var(--bg-secondary) 20%, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Gradient mask bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: 'linear-gradient(to top, var(--bg-secondary) 20%, transparent)',
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
            <div
              key={i}
              onClick={isCenter ? handleCenterClick : undefined}
              style={{
                height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: isCenter ? 'pointer' : 'default',
              }}
            >
              {isCenter && showInput ? (
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onBlur={confirmInput}
                  onKeyDown={e => { if (e.key === 'Enter') confirmInput(); }}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    textAlign: 'center', width: 120,
                    fontSize: 30, fontWeight: 800, color: 'var(--accent-text)',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: isCenter ? 30 : dist === 1 ? 22 : 15,
                    fontWeight: isCenter ? 800 : dist === 1 ? 600 : 400,
                    color: isCenter ? 'var(--accent-text)' : 'var(--text-secondary)',
                    opacity: isCenter ? 1 : dist === 1 ? 0.65 : 0.28,
                    transition: 'font-size 0.1s, opacity 0.1s',
                    lineHeight: 1,
                  }}>
                    {v}
                  </span>
                  {isCenter && suffix && (
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', opacity: 0.8 }}>
                      {suffix}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tap hint on center (shown only when not dragging / not input mode) */}
      {!showInput && (
        <div style={{
          position: 'absolute', top: ITEM_H * 2, height: ITEM_H, left: 20, right: 20,
          zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            tap
          </span>
        </div>
      )}
    </div>
  );
}
