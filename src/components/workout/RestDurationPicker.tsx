'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface Props {
  current: number | null | undefined;
  onSelect: (duration: number | null) => void;
  onClose: () => void;
}

const PRESET_VALUES = new Set([null, 30, 45, 60, 90, 120, 180, 300]);

const OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Aucun minuteur', value: null },
  { label: '30 secondes', value: 30 },
  { label: '45 secondes', value: 45 },
  { label: '1 minute', value: 60 },
  { label: '1 min 30', value: 90 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
];

export default function RestDurationPicker({ current, onSelect, onClose }: Props) {
  const normalized = current ?? null;
  const isCustom = normalized !== null && !PRESET_VALUES.has(normalized);

  const [customMins, setCustomMins] = useState(() =>
    isCustom ? String(Math.floor((normalized as number) / 60)) : ''
  );
  const [customSecs, setCustomSecs] = useState(() =>
    isCustom ? String((normalized as number) % 60) : ''
  );
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleCustomConfirm = () => {
    const total = (parseInt(customMins || '0') * 60) + parseInt(customSecs || '0');
    if (total > 0) { onSelect(total); onClose(); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', paddingBottom: '88px' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-3xl mx-4"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Repos entre les séries
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Options — max ~4 visibles, scroll pour le reste */}
        <div className="px-4 space-y-1.5 overflow-y-auto" style={{ maxHeight: '224px' }}>
          {OPTIONS.map((opt) => {
            const isSelected = !showCustom && opt.value === normalized;
            return (
              <button
                key={String(opt.value)}
                onClick={() => { setShowCustom(false); onSelect(opt.value); onClose(); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-opacity active:opacity-70"
                style={{
                  background: isSelected ? 'rgba(232,134,12,0.12)' : 'var(--bg-elevated)',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  border: isSelected ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>✓</span>}
              </button>
            );
          })}

          {/* Option personnalisée */}
          <button
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-opacity active:opacity-70"
            style={{
              background: showCustom ? 'rgba(232,134,12,0.12)' : 'var(--bg-elevated)',
              color: showCustom ? 'var(--accent)' : 'var(--text-primary)',
              border: showCustom ? '1.5px solid var(--accent)' : '1.5px solid transparent',
            }}
          >
            <span>Personnalisé…</span>
            {showCustom && isCustom && <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>✓</span>}
          </button>
        </div>

        {/* Saisie personnalisée */}
        {showCustom && (
          <div className="px-4 pt-3 pb-4">
            <div
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {/* Minutes */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  placeholder="0"
                  value={customMins}
                  onChange={(e) => setCustomMins(e.target.value)}
                  className="w-full text-center text-2xl font-bold rounded-xl py-2 outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
              </div>

              <span className="text-2xl font-bold pb-5" style={{ color: 'var(--text-muted)' }}>:</span>

              {/* Secondes */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  placeholder="0"
                  value={customSecs}
                  onChange={(e) => setCustomSecs(e.target.value)}
                  className="w-full text-center text-2xl font-bold rounded-xl py-2 outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>sec</span>
              </div>

              {/* Valider */}
              <button
                onClick={handleCustomConfirm}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 self-start mt-0.5"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <Check size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {!showCustom && <div className="pb-4" />}
      </div>
    </div>
  );
}
