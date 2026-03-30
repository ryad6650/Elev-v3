import { fetchNutritionData } from '@/lib/nutrition';
import NutritionPageClient from '@/components/nutrition/NutritionPageClient';

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function NutritionPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const date = params.date ?? today;

  try {
    const data = await fetchNutritionData(date);
    return <NutritionPageClient data={data} />;
  } catch {
    return (
      <main className="px-4 pt-6 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1
          className="text-3xl leading-tight mb-5"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
          }}
        >
          Nutrition
        </h1>
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Connectez-vous pour accéder à votre journal nutritionnel.
          </p>
        </div>
      </main>
    );
  }
}
