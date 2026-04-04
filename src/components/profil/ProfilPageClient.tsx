"use client";

import { lazy, Suspense, type ReactNode } from "react";
import type { ProfilData } from "@/lib/profil";
import ProfilHeader from "./ProfilHeader";
import ProfilInfosForm from "./ProfilInfosForm";
import ProfilObjectifsForm from "./ProfilObjectifsForm";
import ProfilCompte from "./ProfilCompte";

const ProfilPreferences = lazy(() => import("./ProfilPreferences"));

interface Props {
  profil: ProfilData;
  statsSlot: ReactNode;
}

function PreferencesSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 mb-5 animate-pulse"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        height: 200,
      }}
    />
  );
}

export default function ProfilPageClient({ profil, statsSlot }: Props) {
  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <ProfilHeader profil={profil} />
      {statsSlot}
      <ProfilInfosForm profil={profil} />
      <ProfilObjectifsForm profil={profil} />
      <Suspense fallback={<PreferencesSkeleton />}>
        <ProfilPreferences profil={profil} />
      </Suspense>
      <ProfilCompte />
    </main>
  );
}
