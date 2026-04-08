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

  const refreshData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    fetchPoidsData(supabase, user.id)
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  // Update optimiste : met à jour l'UI immédiatement sans attendre le réseau
  const optimisticUpsert = useCallback(
    (date: string, poids: number) => {
      setData((prev) => {
        const exists = prev.entries.findIndex((e) => e.date === date);
        let entries: PoidsEntry[];
        if (exists >= 0) {
          entries = prev.entries.map((e) =>
            e.date === date ? { ...e, poids } : e,
          );
        } else {
          entries = [
            ...prev.entries,
            { id: crypto.randomUUID(), date, poids },
          ].sort((a, b) => a.date.localeCompare(b.date));
        }
        return { ...prev, entries };
      });
      // Sync serveur en arrière-plan
      refreshData();
    },
    [refreshData],
  );

  // Suppression optimiste
  const optimisticDelete = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
      }));
      refreshData();
    },
    [refreshData],
  );

  const entries = data.entries;
  const current = entries.length > 0 ? entries[entries.length - 1] : null;
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;

  return (
    <main
      className="pt-5 pb-28 page-enter"
      style={{ maxWidth: 430, margin: "0 auto", padding: "20px 16px 112px" }}
    >
      {/* En-tête */}
      <div className="mb-4" style={{ padding: "0 6px" }}>
        <div
          className="font-medium"
          style={{
            fontSize: "11px",
            color: "var(--accent-text)",
            opacity: 0.8,
            letterSpacing: "0.05em",
          }}
        >
          Suivi
        </div>
        <h1
          className="leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "2rem",
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
          }}
        >
          Poids.
        </h1>
      </div>

      {/* Hero — grand chiffre + saisie inline */}
      <PoidsHero
        poidsActuel={current?.poids ?? null}
        poidsVeille={previous?.poids ?? null}
        onSaved={optimisticUpsert}
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
        onDeleted={optimisticDelete}
      />

      {modal.open && (
        <AddPoidsModal
          defaultDate={modal.entry?.date}
          defaultPoids={modal.entry?.poids}
          onClose={() => setModal({ open: false })}
          onSaved={optimisticUpsert}
        />
      )}
    </main>
  );
}
