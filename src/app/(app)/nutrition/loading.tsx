export default function NutritionLoading() {
  return (
    <div
      className="px-4 pt-6 pb-28 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div
          className="h-9 w-32 rounded-lg"
          style={{ background: "var(--bg-elevated)" }}
        />
        <div
          className="h-8 w-28 rounded-full"
          style={{ background: "var(--bg-elevated)" }}
        />
      </div>

      {/* Calories header */}
      <div
        className="h-40 rounded-2xl mb-4"
        style={{ background: "var(--bg-secondary)" }}
      />

      {/* Meals */}
      <div
        className="h-3 w-14 rounded mb-3"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div
        className="h-20 rounded-2xl mb-3"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-20 rounded-2xl mb-3"
        style={{ background: "var(--bg-secondary)" }}
      />

      {/* CTA */}
      <div
        className="h-14 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
    </div>
  );
}
