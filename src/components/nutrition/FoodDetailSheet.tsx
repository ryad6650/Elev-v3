'use client';

import { useState } from 'react';
import { ChevronLeft, Heart, Minus, Plus, Pencil } from 'lucide-react';
import type { NutritionAliment } from '@/lib/nutrition-utils';

const REPAS_LABELS: Record<string, string> = {
  'petit-dejeuner': 'Petit-déjeuner', 'dejeuner': 'Déjeuner',
  'diner': 'Dîner', 'snacks': 'Collations',
};

interface Props {
  aliment: NutritionAliment;
  repas: string;
  onBack: () => void;
  onConfirm: (quantite: number) => void;
  onEdit?: () => void;
  pending?: boolean;
}

export default function FoodDetailSheet({ aliment, repas, onBack, onConfirm, onEdit, pending }: Props) {
  const portionG = aliment.taille_portion_g ?? 0;
  const hasPortion = portionG > 0;
  const [mode, setMode] = useState<'g' | 'portion'>(hasPortion ? 'portion' : 'g');
  const [qty, setQty] = useState(hasPortion ? portionG : 100);
  const [fav, setFav] = useState(false);

  const step = mode === 'portion' ? portionG : 10;
  const scale = qty / 100;
  const cal = Math.round(aliment.calories * scale);
  const prot = Math.round((aliment.proteines ?? 0) * scale * 10) / 10;
  const gluc = Math.round((aliment.glucides ?? 0) * scale * 10) / 10;
  const lip = Math.round((aliment.lipides ?? 0) * scale * 10) / 10;
  const calP = (aliment.proteines ?? 0) * 4;
  const calG = (aliment.glucides ?? 0) * 4;
  const calL = (aliment.lipides ?? 0) * 9;
  const calTotal = calP + calG + calL || 1;
  const pPct = (calP / calTotal) * 100;
  const gPct = (calG / calTotal) * 100;
  const lPct = (calL / calTotal) * 100;
  const nPortions = hasPortion ? Math.round(qty / portionG * 10) / 10 : 0;

  function switchMode(m: 'g' | 'portion') {
    setMode(m);
    setQty(m === 'portion' ? portionG : 100);
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: 'calc(100dvh - 100px - env(safe-area-inset-top, 20px))' }}>
      <div className="flex items-center justify-between px-4 pt-1 pb-3 shrink-0">
        <button onClick={onBack} className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <ChevronLeft size={17} style={{ color: 'var(--text-primary)' }} />
        </button>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{REPAS_LABELS[repas] ?? repas}</p>
        <div className="flex gap-1.5">
          {onEdit && (
            <button onClick={onEdit} className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <Pencil size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          <button onClick={() => setFav(f => !f)} className="p-2 rounded-xl transition-colors"
            style={{ background: fav ? 'var(--accent-bg)' : 'var(--bg-elevated)' }}>
            <Heart size={17} fill={fav ? 'var(--accent)' : 'none'} style={{ color: fav ? 'var(--accent)' : 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="flex flex-col items-center pb-5 pt-1">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-3"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent-text)', border: '1px solid rgba(232,134,12,0.2)' }}>
            {aliment.nom.charAt(0).toUpperCase()}
          </div>
          <p className="text-center text-xl leading-snug"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
            {aliment.nom}
          </p>
          {aliment.marque && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{aliment.marque}</p>}
          {aliment.source === 'openfoodfacts' && (
            <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>OpenFoodFacts</span>
          )}
        </div>

        <div className="rounded-2xl p-4 mb-3 flex items-center gap-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="relative w-20 h-20 shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--accent)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset="0" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold leading-none" style={{ color: 'var(--accent-text)' }}>{aliment.calories}</span>
              <span className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-muted)' }}>kcal</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              { dot: '#3B82F6', label: 'Protéines', val: aliment.proteines, pct: Math.round(pPct) },
              { dot: '#EAB308', label: 'Glucides', val: aliment.glucides, pct: Math.round(gPct) },
              { dot: '#EF4444', label: 'Lipides', val: aliment.lipides, pct: Math.round(lPct) },
              { dot: '#22C55E', label: 'Fibres', val: aliment.fibres ?? null, pct: null },
            ].map(({ dot, label, val, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                <span className="text-[11px] w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{val ?? 0}g</span>
                {pct !== null && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pct}%</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="h-2.5 rounded-full flex gap-0.5 mb-3 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full" style={{ width: `${pPct}%`, background: '#3B82F6', opacity: 0.85 }} />
            <div className="h-full rounded-full" style={{ width: `${gPct}%`, background: '#EAB308', opacity: 0.85 }} />
            <div className="h-full rounded-full" style={{ width: `${lPct}%`, background: '#EF4444', opacity: 0.85 }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{label:'Protéines',v:aliment.proteines??0,c:'#93C5FD'},{label:'Glucides',v:aliment.glucides??0,c:'#FDE047'},{label:'Lipides',v:aliment.lipides??0,c:'#FCA5A5'}].map(({label,v,c})=>(
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-lg font-extrabold leading-none" style={{ color: c }}>{v}<span className="text-xs font-medium">g</span></p>
                <p className="text-[10px] mt-1.5 font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Valeurs pour 100g</p>
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {[
            { label: 'Énergie', val: `${aliment.calories} kcal`, hl: true },
            { label: 'Protéines', val: `${aliment.proteines ?? 0} g` },
            { label: 'Glucides', val: `${aliment.glucides ?? 0} g` },
            { label: 'dont sucres', val: aliment.sucres != null ? `${aliment.sucres} g` : '—', sub: true },
            { label: 'Lipides', val: `${aliment.lipides ?? 0} g` },
            { label: 'Fibres', val: aliment.fibres != null ? `${aliment.fibres} g` : '—' },
            { label: 'Sel', val: aliment.sel != null ? `${aliment.sel} g` : '—' },
          ].map(({ label, val, hl, sub }, i, a) => (
            <div key={label} className="flex justify-between items-center"
              style={{ padding: sub ? '10px 16px 10px 32px' : '10px 16px', borderBottom: i < a.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-sm" style={{ color: sub ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{label}</span>
              <span className="text-sm" style={{ color: hl ? 'var(--accent-text)' : sub ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: hl ? 700 : 600 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-4 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {hasPortion && (
          <div className="flex justify-center mb-3">
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {(['g', 'portion'] as const).map(m => (
                <button key={m} onClick={() => switchMode(m)} className="px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: mode === m ? 'var(--accent)' : 'var(--bg-card)', color: mode === m ? 'white' : 'var(--text-muted)' }}>
                  {m === 'g' ? 'Grammes' : (aliment.portion_nom ?? 'Portion')}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-5 mb-2">
          <button onClick={() => setQty(q => Math.max(mode === 'portion' ? portionG : 1, q - step))}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <Minus size={16} />
          </button>
          <div className="text-center min-w-[100px]">
            <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {mode === 'portion' ? nPortions : qty}
            </span>
            <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>
              {mode === 'portion' ? (aliment.portion_nom ?? 'portion') : 'g'}
            </span>
            {mode === 'portion' && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{qty}g</p>}
          </div>
          <button onClick={() => setQty(q => q + step)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <Plus size={16} />
          </button>
        </div>
        <p className="text-center text-sm font-semibold mb-3" style={{ color: 'var(--accent-text)' }}>
          ≈ {cal} kcal · P {prot}g · G {gluc}g · L {lip}g
        </p>
        <button onClick={() => onConfirm(qty)} disabled={pending}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-opacity"
          style={{ background: 'var(--accent)', opacity: pending ? 0.6 : 1, boxShadow: '0 4px 20px rgba(232,134,12,0.3)' }}>
          {pending ? 'Ajout...' : `Ajouter au ${REPAS_LABELS[repas] ?? repas}`}
        </button>
      </div>
    </div>
  );
}
