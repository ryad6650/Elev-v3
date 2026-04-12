export default function Loading() {
  return (
    <div
      className="px-4 pt-5 pb-28 space-y-4 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <div
        className="h-8 w-36 rounded-lg"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div
        className="h-44 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-32 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-24 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
    </div>
  );
}
