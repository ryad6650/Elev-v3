"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import type { WeeklyReportData } from "@/lib/weekly-report";
import ReportContent from "@/components/rapport-hebdo/ReportContent";

interface Props {
  data: WeeklyReportData;
}

function formatRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const s = new Date(start + "T00:00:00").toLocaleDateString("fr-FR", opts);
  const e = new Date(end + "T00:00:00").toLocaleDateString("fr-FR", opts);
  return `${s} — ${e}`;
}

export default function WeeklyReportClient({ data }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!reportRef.current || downloading) return;
    setDownloading(true);

    try {
      // Import dynamique pour éviter le bundle côté serveur
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0c0a09",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `rapport-${data.weekStart}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback : impression navigateur
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0c0a09",
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;
      const file = new File([blob], `rapport-${data.weekStart}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback téléchargement
        await handleDownload();
      }
    } catch {
      // Ignoré si l'utilisateur annule le partage
    }
  }

  return (
    <main
      className="px-4 pt-5 pb-8 space-y-4 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={18} />
          Retour
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.97]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <Share2 size={14} />
            Partager
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
            style={{
              background: "var(--accent)",
              color: "#fff",
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <Download size={14} />
            {downloading ? "..." : "Télécharger"}
          </button>
        </div>
      </div>

      <p
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Rapport hebdomadaire
      </p>
      <h1
        style={{
          fontFamily: "var(--font-lora)",
          fontStyle: "italic",
          fontSize: 28,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {formatRange(data.weekStart, data.weekEnd)}
      </h1>

      {/* Contenu du rapport (capturé pour l'export) */}
      <div ref={reportRef}>
        <ReportContent data={data} />
      </div>
    </main>
  );
}
