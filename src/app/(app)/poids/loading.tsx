export default function PoidsLoading() {
  return (
    <div
      className="px-4 pt-6 pb-28 animate-pulse"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      <div
        className="h-9 w-24 rounded-lg mb-5"
        style={{ background: "var(--bg-elevated)" }}
      />
      <div
        className="h-28 rounded-2xl mb-4"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-52 rounded-2xl mb-4"
        style={{ background: "var(--bg-secondary)" }}
      />
      <div
        className="h-32 rounded-2xl"
        style={{ background: "var(--bg-secondary)" }}
      />
    </div>
  );
}
