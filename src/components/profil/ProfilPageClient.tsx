"use client";

import type { ProfilPageData } from "@/lib/profil";
import ProfilHeader from "./ProfilHeader";
import ProfilStats from "./ProfilStats";
import ProfilInfosForm from "./ProfilInfosForm";
import ProfilObjectifsForm from "./ProfilObjectifsForm";
import ProfilPreferences from "./ProfilPreferences";
import ProfilCompte from "./ProfilCompte";

interface Props {
  initialData: ProfilPageData;
}

export default function ProfilPageClient({ initialData }: Props) {
  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <ProfilHeader profil={initialData.profil} />
      <ProfilStats stats={initialData.stats} />
      <ProfilInfosForm profil={initialData.profil} />
      <ProfilObjectifsForm profil={initialData.profil} />
      <ProfilPreferences profil={initialData.profil} />
      <ProfilCompte />
    </main>
  );
}
