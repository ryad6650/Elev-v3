export default function HistoriqueLoading() {
  return (
    <div
      className="px-4 pt-6 pb-28 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <div
        className="h-9 w-32 rounded-lg mb-5"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="h-20 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-20 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
      <div
        className="h-72 rounded-2xl mb-4"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div className="space-y-2">
        <div
          className="h-16 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-16 rounded-2xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
    </div>
  );
}
