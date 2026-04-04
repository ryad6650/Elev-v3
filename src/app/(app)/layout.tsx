import { unstable_cache } from "next/cache";
import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ActiveWorkoutBanner from "@/components/layout/ActiveWorkoutBanner";
import AccentInit from "@/components/layout/AccentInit";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ACCENT } from "@/lib/profil";
import { computeAccentCSS } from "@/lib/accent-compute";

const DEFAULT_PROFILE = {
  accent: DEFAULT_ACCENT,
  secondary: null as string | null,
  balance: 50,
  theme: "dark" as "dark" | "light",
};

const getLayoutProfile = unstable_cache(
  async (userId: string) => {
    try {
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
    } catch (err) {
      console.error("[Layout] Erreur fetch profil:", err);
      return DEFAULT_PROFILE;
    }
  },
  ["layout-profile"],
  { revalidate: 300, tags: ["layout-profile"] },
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let accent = DEFAULT_ACCENT;
  let secondary: string | null = null;
  let balance = 50;
  let theme: "dark" | "light" = "dark";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profil = await getLayoutProfile(user.id);
      accent = profil.accent;
      secondary = profil.secondary;
      balance = profil.balance;
      theme = profil.theme;
    }
  } catch (err) {
    console.error("[Layout] Erreur auth:", err);
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
