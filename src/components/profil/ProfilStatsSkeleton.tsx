function SkeletonCard() {
  return (
    <div
      className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-5 h-5 rounded-full animate-pulse"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div
        className="w-10 h-7 rounded animate-pulse"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div
        className="w-14 h-3 rounded animate-pulse"
        style={{ background: "var(--bg-elevated)" }}
      />
    </div>
  );
}

export default function ProfilStatsSkeleton() {
  return (
    <div className="flex gap-3 mb-5">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
