import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Profil — Élev" };
import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchProfil } from "@/lib/profil";
import ProfilPageClient from "@/components/profil/ProfilPageClient";
import ProfilStatsAsync from "@/components/profil/ProfilStatsAsync";
import ProfilStatsSkeleton from "@/components/profil/ProfilStatsSkeleton";

export default async function ProfilPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const profil = await fetchProfil(supabase, user.id, {
    email: user.email,
    created_at: user.createdAt,
  });

  return (
    <ProfilPageClient
      profil={profil}
      statsSlot={
        <Suspense fallback={<ProfilStatsSkeleton />}>
          <ProfilStatsAsync userId={user.id} />
        </Suspense>
      }
    />
  );
}
