import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchPoidsData } from "@/lib/poids";
import PoidsPageClient from "@/components/poids/PoidsPageClient";

export const metadata: Metadata = { title: "Poids — Élev" };

async function PoidsContent() {
  const user = await getUserFromMiddleware();
  if (!user) return null;
  const supabase = await createClient();
  const data = await fetchPoidsData(supabase, user.id);
  return <PoidsPageClient initialData={data} />;
}

export default function PoidsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PoidsContent />
    </Suspense>
  );
}
