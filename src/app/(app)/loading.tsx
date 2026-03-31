export default function Loading() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}
