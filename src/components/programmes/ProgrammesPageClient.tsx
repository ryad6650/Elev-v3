"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ProgrammeActifCard from "./ProgrammeActifCard";
import ProgrammeCard from "./ProgrammeCard";
import ProgrammeDetail from "./ProgrammeDetail";
import CreateProgrammeModal from "./CreateProgrammeModal";
import type { ProgrammesPageData, Programme } from "@/lib/programmes";

const FILTRES = ["Tous", "PPL", "Full Body", "Upper / Lower", "Force"];

function matchFiltre(p: Programme, filtre: string): boolean {
  if (filtre === "Tous") return true;
  const txt = `${p.nom} ${p.description ?? ""}`.toLowerCase();
  if (filtre === "PPL")
    return (
      txt.includes("ppl") || (txt.includes("push") && txt.includes("pull"))
    );
  if (filtre === "Full Body") return txt.includes("full");
  if (filtre === "Upper / Lower")
    return txt.includes("upper") || txt.includes("lower");
  if (filtre === "Force") return txt.includes("force") || txt.includes("5x5");
  return txt.includes(filtre.toLowerCase());
}

interface Props {
  data: ProgrammesPageData;
}

export default function ProgrammesPageClient({ data }: Props) {
  const [filtre, setFiltre] = useState("Tous");
  const [selection, setSelection] = useState<Programme | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtres = FILTRES.filter(
    (f) => f === "Tous" || data.programmes.some((p) => matchFiltre(p, f)),
  );
  const programmes = data.programmes.filter((p) => matchFiltre(p, filtre));

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Programmes
        </h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ width: 40, height: 40, background: "var(--green)" }}
          aria-label="Créer un programme"
        >
          <Plus size={18} color="#fff" />
        </button>
      </div>

      {/* Programme actif */}
      {data.programmeActif && (
        <ProgrammeActifCard
          programme={data.programmeActif}
          onClick={() => setSelection(data.programmeActif)}
        />
      )}

      {/* Filtres pills */}
      {filtres.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 mb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {filtres.map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${filtre === f ? "btn-accent" : ""}`}
              style={
                filtre === f
                  ? undefined
                  : {
                      background: "transparent",
                      color: "var(--text-secondary)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }
              }
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Label section */}
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Mes programmes
      </p>

      {/* Liste */}
      {programmes.map((p) => (
        <ProgrammeCard
          key={p.id}
          programme={p}
          estActif={p.id === data.programmeActif?.id}
          onClick={() => setSelection(p)}
        />
      ))}

      {/* État vide */}
      {data.programmes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3 opacity-40">📋</p>
          <h2
            className="text-xl mb-2"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              color: "var(--text-secondary)",
            }}
          >
            Aucun programme
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Crée ton premier programme d&apos;entraînement structuré.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--green)" }}
          >
            Créer un programme
          </button>
        </div>
      )}

      {programmes.length === 0 && data.programmes.length > 0 && (
        <p
          className="text-center text-sm py-10"
          style={{ color: "var(--text-muted)" }}
        >
          Aucun programme dans cette catégorie.
        </p>
      )}

      {/* Bottom sheet détail */}
      {selection && (
        <ProgrammeDetail
          programme={selection}
          estActif={selection.id === data.programmeActif?.id}
          onClose={() => setSelection(null)}
        />
      )}

      {/* Bottom sheet création */}
      {createOpen && (
        <CreateProgrammeModal
          routinesDisponibles={data.routinesDisponibles}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </main>
  );
}
