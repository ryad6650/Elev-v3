import { unstable_cache } from "next/cache";
import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ActiveWorkoutBanner from "@/components/layout/ActiveWorkoutBanner";
import AccentInit from "@/components/layout/AccentInit";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ACCENT } from "@/lib/profil";
import { computeAccentCSS } from "@/lib/accent-compute";

const getLayoutProfile = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient();
    const { data: profil } = await supabase
      .from("profiles")
      .select("accent_color, accent_secondary, gradient_intensity, theme")
      .eq("id", userId)
      .single();
    return {
      accent: profil?.accent_color ?? DEFAULT_ACCENT,
      secondary: profil?.accent_secondary ?? null,
      balance: profil?.gradient_intensity ?? 50,
      theme: (profil?.theme as "dark" | "light") ?? "dark",
    };
  },
  ["layout-profile"],
  { revalidate: 300, tags: ["layout-profile"] },
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accent = DEFAULT_ACCENT;
  let secondary: string | null = null;
  let balance = 50;
  let theme: "dark" | "light" = "dark";

  if (user) {
    const profil = await getLayoutProfile(user.id);
    accent = profil.accent;
    secondary = profil.secondary;
    balance = profil.balance;
    theme = profil.theme;
  }

  const ssrCSS = computeAccentCSS({
    primary: accent,
    secondary,
    balance,
    isDark: theme === "dark",
  });

  return (
    <div className="min-h-dvh pb-20">
      <ServiceWorkerRegistration />
      <AccentInit
        primary={accent}
        secondary={secondary}
        balance={balance}
        ssrCSS={ssrCSS}
        theme={theme}
      />
      <OfflineBanner />
      {children}
      <ActiveWorkoutBanner />
      <BottomNav />
    </div>
  );
}
