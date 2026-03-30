'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { X, Search, Plus, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addNutritionEntry, createCustomAliment, getRecentAliments } from '@/app/actions/nutrition';
import FoodSearchResults from './FoodSearchResults';
import type { NutritionAliment } from '@/lib/nutrition-utils';

const REPAS_LABELS: Record<string, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'dejeuner': 'Déjeuner',
  'diner': 'Dîner',
  'snacks': 'Collations',
};

type Step = 'search' | 'quantity' | 'custom';
type Repas = 'petit-dejeuner' | 'dejeuner' | 'diner' | 'snacks';

interface Props {
  repas: Repas;
  date: string;
  onClose: () => void;
}

export default function AddFoodModal({ repas, date, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionAliment[]>([]);
  const [recents, setRecents] = useState<NutritionAliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NutritionAliment | null>(null);
  const [quantite, setQuantite] = useState('100');
  const [pending, startTransition] = useTransition();
  const [customNom, setCustomNom] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customGluc, setCustomGluc] = useState('');
  const [customLip, setCustomLip] = useState('');

  useEffect(() => {
    getRecentAliments().then((r) => setRecents(r as NutritionAliment[])).catch(() => {});
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aliments?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  function handleSelect(aliment: NutritionAliment) {
    setSelected(aliment);
    setStep('quantity');
  }

  function handleConfirm() {
    if (!selected) return;
    const qty = parseFloat(quantite);
    if (isNaN(qty) || qty <= 0) return;
    startTransition(async () => {
      await addNutritionEntry(repas, selected.id, qty, date);
      router.refresh();
      onClose();
    });
  }

  function handleCustomSubmit() {
    const cal = parseFloat(customCal);
    if (!customNom || isNaN(cal)) return;
    startTransition(async () => {
      const { id } = await createCustomAliment(
        customNom, cal,
        customProt ? parseFloat(customProt) : null,
        customGluc ? parseFloat(customGluc) : null,
        customLip ? parseFloat(customLip) : null,
      );
      await addNutritionEntry(repas, id, 100, date);
      router.refresh();
      onClose();
    });
  }

  const displayList = query.trim() ? results : recents;
  const previewCal = selected && quantite
    ? Math.round(selected.calories * (parseFloat(quantite) || 0) / 100)
    : null;

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-t-3xl flex flex-col"
        style={{ background: 'var(--bg-secondary)', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          {step !== 'search' ? (
            <button onClick={() => setStep('search')} className="p-1">
              <ChevronLeft size={20} style={{ color: 'var(--text-primary)' }} />
            </button>
          ) : <div className="w-6" />}
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {step === 'custom' ? 'Aliment personnalisé' : `Ajouter — ${REPAS_LABELS[repas]}`}
          </p>
          <button onClick={onClose} className="p-1">
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Étape recherche */}
        {step === 'search' && (
          <div className="flex flex-col gap-3 px-4 pb-6 overflow-y-auto">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un aliment..."
                className="bg-transparent flex-1 text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            {!query.trim() && recents.length > 0 && (
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Récents
              </p>
            )}
            <FoodSearchResults
              results={displayList}
              onSelect={handleSelect}
              loading={loading}
              emptyMessage={query.trim() ? 'Aucun résultat' : 'Aucun aliment récent'}
            />
            <button
              onClick={() => setStep('custom')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{ border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}
            >
              <Plus size={15} /> Créer un aliment personnalisé
            </button>
          </div>
        )}

        {/* Étape quantité */}
        {step === 'quantity' && selected && (
          <div className="px-4 pb-8 flex flex-col gap-4">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{selected.nom}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {selected.calories} kcal · P {selected.proteines ?? 0}g · G {selected.glucides ?? 0}g · L {selected.lipides ?? 0}g
                &nbsp;/ 100g
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Quantité (g)
              </label>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                autoFocus
                className="mt-2 w-full px-4 py-3 rounded-xl text-xl font-bold outline-none"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              />
              {previewCal !== null && (
                <p className="text-center mt-2 text-sm font-semibold" style={{ color: 'var(--accent-text)' }}>
                  ≈ {previewCal} kcal
                </p>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={pending}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity"
              style={{ background: 'var(--accent)', opacity: pending ? 0.6 : 1 }}
            >
              {pending ? 'Ajout...' : 'Confirmer'}
            </button>
          </div>
        )}

        {/* Étape aliment custom */}
        {step === 'custom' && (
          <div className="px-4 pb-8 flex flex-col gap-3 overflow-y-auto">
            {[
              { label: 'Nom *', value: customNom, setter: setCustomNom, type: 'text' },
              { label: 'Calories (kcal / 100g) *', value: customCal, setter: setCustomCal, type: 'number' },
              { label: 'Protéines (g)', value: customProt, setter: setCustomProt, type: 'number' },
              { label: 'Glucides (g)', value: customGluc, setter: setCustomGluc, type: 'number' },
              { label: 'Lipides (g)', value: customLip, setter: setCustomLip, type: 'number' },
            ].map(({ label, value, setter, type }) => (
              <div key={label}>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                />
              </div>
            ))}
            <button
              onClick={handleCustomSubmit}
              disabled={pending || !customNom || !customCal}
              className="w-full py-3 rounded-xl font-semibold text-white mt-2 transition-opacity"
              style={{ background: 'var(--accent)', opacity: pending || !customNom || !customCal ? 0.5 : 1 }}
            >
              {pending ? 'Création...' : 'Créer et ajouter (100g)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
