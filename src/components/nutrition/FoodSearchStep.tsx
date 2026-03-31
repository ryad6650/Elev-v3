'use client';

import { useState } from 'react';
import { Search, ScanBarcode, X, Plus } from 'lucide-react';
import FoodSearchResults from './FoodSearchResults';
import type { NutritionAliment } from '@/lib/nutrition-utils';

const CATEGORIES = [
  { id: 'all', emoji: '🔍', label: 'Tous', mots: [] as string[] },
  { id: 'legumes', emoji: '🥦', label: 'Légumes', mots: ['carotte', 'brocoli', 'épinard', 'tomate', 'courgette', 'haricot', 'salade', 'poivron', 'oignon', 'champignon', 'concombre', 'poireau', 'betterave', 'radis'] },
  { id: 'fruits', emoji: '🍎', label: 'Fruits', mots: ['pomme', 'banane', 'orange', 'fraise', 'raisin', 'pêche', 'poire', 'abricot', 'cerise', 'citron', 'ananas', 'mangue', 'kiwi', 'melon'] },
  { id: 'viandes', emoji: '🥩', label: 'Viandes', mots: ['boeuf', 'poulet', 'porc', 'veau', 'agneau', 'dinde', 'canard', 'lapin', 'jambon', 'lardons', 'saucisse', 'steak', 'côtelette'] },
  { id: 'poissons', emoji: '🐟', label: 'Poissons', mots: ['saumon', 'thon', 'cabillaud', 'sole', 'sardine', 'maquereau', 'dorade', 'bar', 'truite', 'crevette', 'moule', 'colin'] },
  { id: 'laitiers', emoji: '🧀', label: 'Laitiers', mots: ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'cottage', 'ricotta', 'mozzarella', 'skyr'] },
  { id: 'feculents', emoji: '🌾', label: 'Féculents', mots: ['riz', 'pâtes', 'pain', 'pomme de terre', 'quinoa', 'lentille', 'pois chiche', 'boulgour', 'semoule', 'avoine'] },
];

type TabId = 'resultats' | 'recents' | 'favoris';
type CatId = (typeof CATEGORIES)[number]['id'];

interface Props {
  query: string;
  setQuery: (q: string) => void;
  results: NutritionAliment[];
  recents: NutritionAliment[];
  populaires: NutritionAliment[];
  loading: boolean;
  loadingInitial: boolean;
  onSelect: (a: NutritionAliment) => void;
  onScan: () => void;
  onCustom: () => void;
}

function filterByCat(items: NutritionAliment[], catId: CatId): NutritionAliment[] {
  if (catId === 'all') return items;
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat || cat.mots.length === 0) return items;
  return items.filter(a => cat.mots.some(m => a.nom.toLowerCase().includes(m)));
}

export default function FoodSearchStep({
  query, setQuery, results, recents, populaires, loading, loadingInitial, onSelect, onScan, onCustom,
}: Props) {
  const [tab, setTab] = useState<TabId>(query ? 'resultats' : 'recents');
  const [cat, setCat] = useState<CatId>('all');

  function handleQueryChange(val: string) {
    setQuery(val);
    if (val.trim()) setTab('resultats');
    else setTab('recents');
  }

  // Quand pas de récents, afficher les populaires dans l'onglet Récents
  const recentsOrPopulaires = recents.length > 0 ? recents : populaires;
  const recentsLabel = recents.length > 0 ? 'Récents' : 'Populaires';

  const baseList = tab === 'resultats' ? results : tab === 'recents' ? recentsOrPopulaires : [];
  const displayList = filterByCat(baseList, cat);
  const emptyMsg = tab === 'favoris'
    ? 'Aucun favori pour l\'instant'
    : tab === 'recents' ? (loadingInitial ? 'Chargement...' : 'Aucun aliment récent') : 'Aucun résultat';

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 overflow-y-auto">
      {/* Barre de recherche + scan */}
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: query ? '1.5px solid var(--accent)' : '1.5px solid transparent',
            boxShadow: query ? '0 0 0 3px var(--accent-bg)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Rechercher un aliment..."
            className="bg-transparent flex-1 text-sm outline-none min-w-0"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => { handleQueryChange(''); setTab('recents'); }}
              className="p-0.5 rounded-full shrink-0"
              style={{ background: 'var(--bg-card)' }}
            >
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
        <button
          onClick={onScan}
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(232,134,12,0.35)' }}
        >
          <ScanBarcode size={20} color="white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {(['resultats', 'recents', 'favoris'] as TabId[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              background: tab === t ? 'var(--accent)' : 'var(--bg-card)',
              color: tab === t ? 'white' : 'var(--text-muted)',
              border: tab === t ? 'none' : '1px solid var(--border)',
            }}
          >
            {t === 'resultats' ? 'Résultats' : t === 'recents' ? recentsLabel : 'Favoris'}
          </button>
        ))}
      </div>

      {/* Chips catégories */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {CATEGORIES.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => setCat(id as CatId)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-semibold shrink-0 transition-colors"
            style={{
              background: cat === id ? 'var(--accent-bg)' : 'var(--bg-card)',
              color: cat === id ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: cat === id ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
          >
            <span>{emoji}</span>{label}
          </button>
        ))}
      </div>

      {/* Compteur */}
      {tab !== 'favoris' && !loading && displayList.length > 0 && (
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {displayList.length} aliment{displayList.length > 1 ? 's' : ''}
        </p>
      )}

      <FoodSearchResults
        results={displayList}
        onSelect={onSelect}
        loading={loading && tab === 'resultats'}
        emptyMessage={emptyMsg}
      />

      <button
        onClick={onCustom}
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mt-1"
        style={{ border: '1.5px dashed rgba(232,134,12,0.3)', color: 'var(--accent-text)', background: 'transparent' }}
      >
        <Plus size={15} /> Créer un aliment personnalisé
      </button>
    </div>
  );
}
