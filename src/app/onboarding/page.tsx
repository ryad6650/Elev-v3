import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "@/components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Si onboarding déjà fait (prénom renseigné), aller au dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom")
    .eq("id", user.id)
    .single();

  if (profile?.prenom) redirect("/dashboard");

  return <OnboardingClient />;
}
