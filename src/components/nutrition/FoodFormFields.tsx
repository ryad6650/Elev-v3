const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-nunito), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "var(--radius-sm)",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  fontFamily: "var(--font-nunito), sans-serif",
  fontSize: 15,
  fontWeight: 600,
  color: "#fafaf9",
  outline: "none",
};

export { labelStyle, inputStyle };

export function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelStyle}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none"
        style={inputStyle}
      />
    </div>
  );
}

export function MacroField({
  label,
  value,
  onChange,
  unit,
  dot,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  dot?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelStyle}>{label}</div>
      <div className="flex items-center gap-2">
        {dot && (
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: dot }}
          />
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none"
          style={{ ...inputStyle, flex: 1 }}
        />
        <span
          className="shrink-0 text-[13px] font-semibold"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            color: "var(--text-muted)",
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export function SmallField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1">
      <div style={labelStyle}>{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none"
        style={{ ...inputStyle, padding: "12px 14px", fontSize: 14 }}
      />
    </div>
  );
}
