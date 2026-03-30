interface MacroBarProps {
  label: string;
  consumed: number;
  objective: number;
  color: string;
  unit?: string;
}

function MacroBar({ label, consumed, objective, color, unit = "g" }: MacroBarProps) {
  const percent = objective > 0 ? Math.min((consumed / objective) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {consumed}
          {unit} / {objective}
          {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  proteines: { consumed: number; objective: number };
  glucides: { consumed: number; objective: number };
  lipides: { consumed: number; objective: number };
}

export default function MacrosBars({ proteines, glucides, lipides }: Props) {
  return (
    <div className="space-y-3">
      <MacroBar
        label="Protéines"
        consumed={proteines.consumed}
        objective={proteines.objective}
        color="var(--color-protein)"
      />
      <MacroBar
        label="Glucides"
        consumed={glucides.consumed}
        objective={glucides.objective}
        color="var(--color-carbs)"
      />
      <MacroBar
        label="Lipides"
        consumed={lipides.consumed}
        objective={lipides.objective}
        color="var(--color-fat)"
      />
    </div>
  );
}
