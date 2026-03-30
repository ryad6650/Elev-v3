"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import PoidsChart from "./PoidsChart";
import PoidsStats from "./PoidsStats";
import PoidsIMC from "./PoidsIMC";
import PoidsHistorique from "./PoidsHistorique";
import AddPoidsModal from "./AddPoidsModal";
import type { PoidsPageData, PoidsEntry } from "@/lib/poids";

interface Props {
  data: PoidsPageData;
}

export default function PoidsPageClient({ data }: Props) {
  const [modal, setModal] = useState<{
    open: boolean;
    entry?: PoidsEntry;
  }>({ open: false });

  const currentPoids =
    data.entries.length > 0
      ? data.entries[data.entries.length - 1].poids
      : null;

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Poids
        </h1>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Scale size={16} />
          Peser
        </button>
      </div>

      <PoidsStats entries={data.entries} />

      <PoidsChart entries={data.entries} />

      <PoidsIMC poids={currentPoids} taille={data.taille} />

      <PoidsHistorique
        entries={data.entries}
        onEdit={(entry) => setModal({ open: true, entry })}
      />

      {data.entries.length === 0 && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-4xl mb-3"
            style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "var(--text-primary)" }}
          >
            ⚖️
          </p>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Commencez le suivi
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Enregistrez votre première pesée pour voir votre progression.
          </p>
        </div>
      )}

      {modal.open && (
        <AddPoidsModal
          defaultDate={modal.entry?.date}
          defaultPoids={modal.entry?.poids}
          onClose={() => setModal({ open: false })}
        />
      )}
    </main>
  );
}
