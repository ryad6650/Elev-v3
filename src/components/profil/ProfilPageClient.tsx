"use client";

import type { ProfilPageData } from "@/lib/profil";
import ProfilHeader from "./ProfilHeader";
import ProfilStats from "./ProfilStats";
import ProfilInfosForm from "./ProfilInfosForm";
import ProfilObjectifsForm from "./ProfilObjectifsForm";
import ProfilPreferences from "./ProfilPreferences";
import ProfilCompte from "./ProfilCompte";

interface Props {
  data: ProfilPageData;
}

export default function ProfilPageClient({ data }: Props) {
  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <ProfilHeader profil={data.profil} />
      <ProfilStats stats={data.stats} />
      <ProfilInfosForm profil={data.profil} />
      <ProfilObjectifsForm profil={data.profil} />
      <ProfilPreferences profil={data.profil} />
      <ProfilCompte />
    </main>
  );
}
