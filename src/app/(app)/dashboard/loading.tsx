export default function DashboardLoading() {
  return (
    <div
      className="px-4 pt-5 pb-28 space-y-4 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Date + titre */}
      <div>
        <div
          className="h-3 w-28 rounded mb-3"
          style={{ background: "var(--bg-elevated)" }}
        />
        <div
          className="h-10 w-40 rounded-lg"
          style={{ background: "var(--bg-elevated)" }}
        />
        <div className="flex gap-2 mt-3">
          <div
            className="h-6 w-20 rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          />
          <div
            className="h-6 w-24 rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          />
        </div>
      </div>

      {/* Calories ring */}
      <div
        className="h-44 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />

      {/* Macros */}
      <div
        className="h-28 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />

      {/* Workout card */}
      <div
        className="h-24 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="h-24 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-24 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
    </div>
  );
}
