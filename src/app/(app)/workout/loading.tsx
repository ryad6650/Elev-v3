export default function WorkoutLoading() {
  return (
    <div
      className="px-4 pt-6 pb-28 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="mb-5">
        <div
          className="h-3 w-44 rounded mb-2"
          style={{ background: "var(--bg-elevated)" }}
        />
        <div
          className="h-9 w-28 rounded-lg"
          style={{ background: "var(--bg-elevated)" }}
        />
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3 mb-6">
        <div
          className="flex-1 h-12 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="flex-1 h-12 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>

      {/* Routine cards */}
      <div className="space-y-3">
        <div
          className="h-28 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-28 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-28 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
    </div>
  );
}
