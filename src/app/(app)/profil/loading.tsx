export default function ProfilLoading() {
  return (
    <div
      className="px-4 pt-6 pb-28 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Avatar + nom */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full"
          style={{ background: "var(--bg-elevated)" }}
        />
        <div>
          <div
            className="h-7 w-32 rounded-lg mb-1"
            style={{ background: "var(--bg-elevated)" }}
          />
          <div
            className="h-3 w-24 rounded"
            style={{ background: "var(--bg-elevated)" }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div
          className="h-20 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-20 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-20 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>

      {/* Sections */}
      <div
        className="h-48 rounded-2xl mb-4"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-36 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
    </div>
  );
}
