import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ActiveWorkoutBanner from "@/components/layout/ActiveWorkoutBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import VisibilityRefresh from "@/components/layout/VisibilityRefresh";
import ToastContainer from "@/components/ui/Toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20">
      <ServiceWorkerRegistration />
      <OfflineBanner />
      <VisibilityRefresh />
      {children}
      <ActiveWorkoutBanner />
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
