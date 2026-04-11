import { memo } from "react";

interface MacroBarProps {
  label: string;
  consumed: number;
  objective: number;
  color: string;
}

function MacroBar({ label, consumed, objective, color }: MacroBarProps) {
  const percent =
    objective > 0 ? Math.min((consumed / objective) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {consumed} / {objective}g
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 6, background: "var(--bg-elevated)" }}
      >
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

export default memo(function MacrosBars({
  proteines,
  glucides,
  lipides,
}: Props) {
  return (
    <div className="space-y-3.5">
      <MacroBar
        label="Glucides"
        consumed={glucides.consumed}
        objective={glucides.objective}
        color="#EAB308"
      />
      <MacroBar
        label="Protéines"
        consumed={proteines.consumed}
        objective={proteines.objective}
        color="#74BF7A"
      />
      <MacroBar
        label="Lipides"
        consumed={lipides.consumed}
        objective={lipides.objective}
        color="#A78BFA"
      />
    </div>
  );
});
