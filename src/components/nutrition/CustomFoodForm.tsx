'use client';

import { useState, useTransition } from 'react';
import { createCustomAliment, updateCustomAliment } from '@/app/actions/nutrition';
import type { NutritionAliment } from '@/lib/nutrition-utils';

interface Props {
  repas?: string;
  date?: string;
  onCreated?: (id: string) => void;
  onEdited?: (aliment: NutritionAliment) => void;
  editAliment?: NutritionAliment;
}

const BASE_FIELDS = [
  { label: 'Nom *', key: 'nom' as const, type: 'text' },
  { label: 'Calories (kcal / 100g) *', key: 'cal' as const, type: 'number' },
  { label: 'Protéines (g)', key: 'prot' as const, type: 'number' },
  { label: 'Glucides (g)', key: 'gluc' as const, type: 'number' },
  { label: 'Lipides (g)', key: 'lip' as const, type: 'number' },
] as const;

type ValKey = 'nom' | 'cal' | 'prot' | 'gluc' | 'lip' | 'portionNom' | 'portionG';

export default function CustomFoodForm({ onCreated, onEdited, editAliment }: Props) {
  const isEdit = !!editAliment?.id;
  const [vals, setVals] = useState<Record<ValKey, string>>({
    nom: editAliment?.nom ?? '',
    cal: editAliment?.calories?.toString() ?? '',
    prot: editAliment?.proteines?.toString() ?? '',
    gluc: editAliment?.glucides?.toString() ?? '',
    lip: editAliment?.lipides?.toString() ?? '',
    portionNom: editAliment?.portion_nom ?? '',
    portionG: editAliment?.taille_portion_g?.toString() ?? '',
  });
  const [showPortion, setShowPortion] = useState(!!(editAliment?.taille_portion_g));
  const [pending, startTransition] = useTransition();

  function set(key: ValKey, val: string) {
    setVals(prev => ({ ...prev, [key]: val }));
  }

  function handleSubmit() {
    const cal = parseFloat(vals.cal);
    if (!vals.nom || isNaN(cal)) return;
    const portionNom = showPortion && vals.portionNom ? vals.portionNom : null;
    const portionG = showPortion && vals.portionG ? parseFloat(vals.portionG) : null;
    const prot = vals.prot ? parseFloat(vals.prot) : null;
    const gluc = vals.gluc ? parseFloat(vals.gluc) : null;
    const lip = vals.lip ? parseFloat(vals.lip) : null;

    startTransition(async () => {
      if (isEdit && editAliment) {
        await updateCustomAliment(editAliment.id, vals.nom, cal, prot, gluc, lip, portionNom, portionG);
        onEdited?.({ ...editAliment, nom: vals.nom, calories: cal, proteines: prot, glucides: gluc, lipides: lip, portion_nom: portionNom, taille_portion_g: portionG });
      } else {
        const { id } = await createCustomAliment(vals.nom, cal, prot, gluc, lip, portionNom, portionG);
        onCreated?.(id);
      }
    });
  }

  const disabled = pending || !vals.nom || !vals.cal;

  return (
    <div className="px-4 pb-8 flex flex-col gap-3 overflow-y-auto">
      {BASE_FIELDS.map(({ label, key, type }) => (
        <div key={key}>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {label}
          </label>
          <input
            type={type}
            value={vals[key]}
            onChange={(e) => set(key, e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>
      ))}

      {/* Section portion */}
      <button
        type="button"
        onClick={() => setShowPortion(p => !p)}
        className="flex items-center gap-2 text-xs font-semibold py-1"
        style={{ color: showPortion ? 'var(--accent-text)' : 'var(--text-muted)' }}
      >
        <span>{showPortion ? '▼' : '▶'}</span>
        Définir une portion (facultatif)
      </button>

      {showPortion && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Nom
            </label>
            <input
              type="text"
              placeholder="ex: 1 biscuit"
              value={vals.portionNom}
              onChange={e => set('portionNom', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Grammes
            </label>
            <input
              type="number"
              placeholder="ex: 15"
              value={vals.portionG}
              onChange={e => set('portionG', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full py-3 rounded-xl font-semibold text-white mt-2 transition-opacity"
        style={{ background: 'var(--accent)', opacity: disabled ? 0.5 : 1 }}
      >
        {pending
          ? (isEdit ? 'Enregistrement...' : 'Création...')
          : (isEdit ? 'Enregistrer les modifications' : 'Créer et ajouter (100g)')}
      </button>
    </div>
  );
}
