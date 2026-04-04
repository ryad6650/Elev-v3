"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Erreur de chargement
        </h1>
        <p className="text-[var(--text-secondary)] mb-4 text-sm max-w-xs mx-auto">
          {error.message || "Erreur inconnue"}
        </p>
        {error.digest && (
          <p className="text-[var(--text-muted)] text-xs mb-4">
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="text-[var(--accent)] underline text-sm"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
