import { fetchProgrammesData } from '@/lib/programmes';
import ProgrammesPageClient from '@/components/programmes/ProgrammesPageClient';

export default async function ProgrammesPage() {
  try {
    const data = await fetchProgrammesData();
    return <ProgrammesPageClient data={data} />;
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
          Programmes
        </h1>
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Connectez-vous pour accéder à vos programmes.
          </p>
        </div>
      </main>
    );
  }
}
