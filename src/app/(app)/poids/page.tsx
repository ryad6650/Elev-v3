import { fetchPoidsData } from "@/lib/poids";
import PoidsPageClient from "@/components/poids/PoidsPageClient";

export default async function PoidsPage() {
  let data;
  try {
    data = await fetchPoidsData();
  } catch {
    return (
      <main className="px-4 pt-6">
        <h1
          className="text-2xl"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Poids
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Impossible de charger les données.
        </p>
      </main>
    );
  }

  return <PoidsPageClient data={data} />;
}
