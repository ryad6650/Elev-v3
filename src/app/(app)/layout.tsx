import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ActiveWorkoutBanner from "@/components/layout/ActiveWorkoutBanner";
import AccentInit from "@/components/layout/AccentInit";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20">
      <ServiceWorkerRegistration />
      <AccentInit />
      <OfflineBanner />
      {children}
      <ActiveWorkoutBanner />
      <BottomNav />
    </div>
  );
}
