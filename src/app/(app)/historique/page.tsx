import { fetchHistoriqueData } from "@/lib/historique";
import HistoriquePageClient from "@/components/historique/HistoriquePageClient";

export default async function HistoriquePage() {
  try {
    const data = await fetchHistoriqueData();
    return <HistoriquePageClient data={data} />;
  } catch {
    return (
      <main
        className="px-4 pt-6 page-enter"
        style={{ maxWidth: 520, margin: "0 auto" }}
      >
        <h1
          className="text-3xl leading-tight mb-5"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Historique
        </h1>
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Connectez-vous pour voir votre historique.
          </p>
        </div>
      </main>
    );
  }
}
