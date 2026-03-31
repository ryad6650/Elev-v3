'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addNutritionEntry, getRecentAliments, upsertExternalAliment } from '@/app/actions/nutrition';
import FoodSearchStep from './FoodSearchStep';
import FoodDetailSheet from './FoodDetailSheet';
import CustomFoodForm from './CustomFoodForm';
import BarcodeScanner from './BarcodeScanner';
import type { NutritionAliment } from '@/lib/nutrition-utils';

const REPAS_LABELS: Record<string, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'dejeuner': 'Déjeuner',
  'diner': 'Dîner',
  'snacks': 'Collations',
};

type Step = 'search' | 'scan' | 'quantity' | 'custom' | 'edit';
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
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getRecentAliments().then(r => setRecents(r as NutritionAliment[])).catch(() => {});
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
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function handleBarcode(code: string) {
    setStep('search');
    setLoading(true);
    try {
      const res = await fetch(`/api/aliments?barcode=${encodeURIComponent(code)}`);
      const data: NutritionAliment[] = await res.json();
      if (data.length > 0) handleSelect(data[0]);
      else setQuery(code);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(aliment: NutritionAliment) {
    setSelected(aliment);
    setStep('quantity');
  }

  function handleConfirm(quantite: number) {
    if (!selected) return;
    startTransition(async () => {
      let alimentId = selected.id;
      if (!alimentId && selected.source === 'openfoodfacts') {
        const { id } = await upsertExternalAliment(selected);
        alimentId = id;
      }
      await addNutritionEntry(repas, alimentId, quantite, date);
      router.refresh();
      onClose();
    });
  }

  function handleCustomCreated(id: string) {
    startTransition(async () => {
      await addNutritionEntry(repas, id, 100, date);
      router.refresh();
      onClose();
    });
  }

  function handleEdited(updated: NutritionAliment) {
    setSelected(updated);
    setStep('quantity');
    router.refresh();
  }

  const canEdit = selected?.is_global === false;

  const today = new Date().toISOString().split('T')[0];
  const dateLabel = date === today ? "Aujourd'hui" : new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[430px] px-3 mb-20 flex flex-col">
        <div
          className="rounded-3xl flex flex-col w-full"
          style={{
            background: 'var(--bg-secondary)',
            maxHeight: 'calc(100dvh - 100px - env(safe-area-inset-top, 20px))',
          }}
        >
          {step !== 'quantity' && (
            <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
              <div className="w-7" />
              <div className="text-center">
                <p className="font-semibold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
                  {step === 'custom' ? 'Aliment personnalisé' : step === 'edit' ? 'Modifier l\'aliment' : 'Ajouter'}
                </p>
                {step === 'search' && (
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent-text)' }}>
                    {REPAS_LABELS[repas]} · {dateLabel}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="p-1">
                <X size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          )}

          {step === 'scan' && (
            <div className="px-4 pb-6">
              <BarcodeScanner onDetected={handleBarcode} onClose={() => setStep('search')} />
            </div>
          )}

          {step === 'search' && (
            <FoodSearchStep
              query={query}
              setQuery={setQuery}
              results={results}
              recents={recents}
              loading={loading}
              onSelect={handleSelect}
              onScan={() => setStep('scan')}
              onCustom={() => setStep('custom')}
            />
          )}

          {step === 'quantity' && selected && (
            <FoodDetailSheet
              aliment={selected}
              repas={repas}
              onBack={() => setStep('search')}
              onConfirm={handleConfirm}
              onEdit={canEdit ? () => setStep('edit') : undefined}
              pending={pending}
            />
          )}

          {step === 'custom' && (
            <CustomFoodForm repas={repas} date={date} onCreated={handleCustomCreated} />
          )}

          {step === 'edit' && selected && (
            <CustomFoodForm
              repas={repas}
              date={date}
              editAliment={selected}
              onEdited={handleEdited}
            />
          )}
        </div>
      </div>
    </div>
  );
}
