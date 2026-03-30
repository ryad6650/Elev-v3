import { Sparkles } from "lucide-react";

interface Props {
  message: string;
}

export default function InsightCard({ message }: Props) {
  return (
    <div
      className="p-4 rounded-2xl border flex gap-3 items-start"
      style={{
        background: "var(--accent-bg)",
        borderColor: "rgba(232, 134, 12, 0.2)",
      }}
    >
      <div className="shrink-0 mt-0.5">
        <Sparkles size={15} style={{ color: "var(--accent)" }} />
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
    </div>
  );
}
