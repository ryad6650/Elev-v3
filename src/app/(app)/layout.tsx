import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ActiveWorkoutBanner from "@/components/layout/ActiveWorkoutBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-20">
      <OfflineBanner />
      {children}
      <ActiveWorkoutBanner />
      <BottomNav />
    </div>
  );
}
