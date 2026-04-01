"use client";

import { useEffect, useState } from "react";
import type { ProfilPageData } from "@/lib/profil";
import { fetchProfilData } from "@/lib/profil";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCache } from "@/lib/pageCache";
import ProfilHeader from "./ProfilHeader";
import ProfilStats from "./ProfilStats";
import ProfilInfosForm from "./ProfilInfosForm";
import ProfilObjectifsForm from "./ProfilObjectifsForm";
import ProfilPreferences from "./ProfilPreferences";
import ProfilCompte from "./ProfilCompte";

const CACHE_KEY = "profil";

export default function ProfilPageClient() {
  const [data, setData] = useState<ProfilPageData | null>(getCached<ProfilPageData>(CACHE_KEY));

  useEffect(() => {
    const supabase = createClient();
    fetchProfilData(supabase).then((d) => {
      setData(d);
      setCache(CACHE_KEY, d);
    }).catch(console.error);
  }, []);

  if (!data) return (
    <main className="px-4 pt-6" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="flex items-center justify-center" style={{ height: "50vh" }}>
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    </main>
  );

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
