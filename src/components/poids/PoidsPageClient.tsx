"use client";

import { useCallback, useState } from "react";
import PoidsHero from "./PoidsHero";
import PoidsChart from "./PoidsChart";
import PoidsComposition from "./PoidsComposition";
import PoidsHistorique from "./PoidsHistorique";
import MensurationsCard from "./MensurationsCard";
import AddPoidsModal from "./AddPoidsModal";
import { createClient } from "@/lib/supabase/client";
import { fetchPoidsData } from "@/lib/poids";
import type { PoidsPageData, PoidsEntry } from "@/lib/poids";

const EMPTY_MENSURATIONS = {
  cou: null,
  tour_taille: null,
  poitrine: null,
  hanches: null,
  bras: null,
  cuisse: null,
  mollet: null,
};

interface Props {
  initialData: PoidsPageData;
}

export default function PoidsPageClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [modal, setModal] = useState<{ open: boolean; entry?: PoidsEntry }>({
    open: false,
  });

  const refreshData = useCallback(() => {
    const supabase = createClient();
    fetchPoidsData(supabase)
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  const entries = data.entries;
  const current = entries.length > 0 ? entries[entries.length - 1] : null;
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tête */}
      <div className="mb-5">
        <div
          className="font-semibold uppercase mb-1"
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          Suivi corporel
        </div>
        <h1
          className="leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "1.9rem",
            color: "var(--text-primary)",
          }}
        >
          Poids
        </h1>
      </div>

      {/* Hero — grand chiffre + saisie inline */}
      <PoidsHero
        poidsActuel={current?.poids ?? null}
        poidsVeille={previous?.poids ?? null}
        onSaved={refreshData}
      />

      {/* Graphique */}
      <PoidsChart entries={entries} />

      {/* Composition (IMC + masse grasse) */}
      <PoidsComposition
        poids={current?.poids ?? null}
        taille={data.taille}
        mensurationsCou={data.mensurations?.cou ?? null}
        mensurationsTaille={data.mensurations?.tour_taille ?? null}
      />

      {/* Mensurations */}
      <MensurationsCard initial={data.mensurations ?? EMPTY_MENSURATIONS} />

      {/* Historique des pesées */}
      <PoidsHistorique
        entries={entries}
        onEdit={(entry) => setModal({ open: true, entry })}
        onDeleted={refreshData}
      />

      {modal.open && (
        <AddPoidsModal
          defaultDate={modal.entry?.date}
          defaultPoids={modal.entry?.poids}
          onClose={() => setModal({ open: false })}
          onSaved={refreshData}
        />
      )}
    </main>
  );
}
