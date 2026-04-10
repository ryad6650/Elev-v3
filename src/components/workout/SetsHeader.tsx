const hdrStyle: React.CSSProperties = {
  fontFamily: "var(--font-nunito), sans-serif",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

export default function SetsHeader() {
  return (
    <div
      className="grid px-4 pt-3 pb-1.5"
      style={{
        gridTemplateColumns: "40px 1fr 80px 70px 40px",
        gap: "0 8px",
      }}
    >
      <span className="text-center" style={hdrStyle}>
        Série
      </span>
      <span className="text-center" style={hdrStyle}>
        Précédent
      </span>
      <span className="text-center" style={hdrStyle}>
        ++ KG
      </span>
      <span className="text-center" style={hdrStyle}>
        Réps
      </span>
      <span
        className="text-center"
        style={{ color: "var(--text-muted)", fontSize: 12 }}
      >
        ✓
      </span>
    </div>
  );
}
