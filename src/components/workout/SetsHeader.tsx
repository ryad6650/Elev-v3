const hdrStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  color: "var(--text-muted)",
};

export default function SetsHeader() {
  return (
    <div
      className="grid px-[18px] pt-2.5 pb-1"
      style={{
        gridTemplateColumns: "32px 1fr 1fr 1fr 36px",
        gap: "4px 6px",
      }}
    >
      {["#", "Poids", "Reps", "Préc."].map((label) => (
        <span
          key={label}
          className="text-[9px] font-semibold uppercase tracking-[0.04em] text-center"
          style={hdrStyle}
        >
          {label}
        </span>
      ))}
      <span />
    </div>
  );
}
