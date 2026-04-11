"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

/** Affichée uniquement le lundi sur le dashboard */
export default function MondayReportCard() {
  const today = new Date();
  const isMonday = today.getDay() === 1;

  if (!isMonday) return null;

  return (
    <Link href="/rapport-hebdo" className="block">
      <div
        className="p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98]"
        style={{
          background: "var(--grad-monday)",
          borderColor: "rgba(30,157,76,0.25)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width: 44,
            height: 44,
            background: "rgba(27,46,29,0.35)",
            border: "1px solid rgba(30,157,76,0.3)",
          }}
        >
          <FileText size={20} style={{ color: "#1E9D4C" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "#74BF7A" }}>
            Rapport hebdomadaire prêt
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Envoie ton récap de la semaine à ton coach
          </p>
        </div>
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "#1E9D4C",
          }}
        >
          <ArrowRight size={16} color="#fff" />
        </div>
      </div>
    </Link>
  );
}
