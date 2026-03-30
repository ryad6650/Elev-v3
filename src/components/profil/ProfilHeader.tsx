import type { ProfilData } from "@/lib/profil";

interface Props {
  profil: ProfilData;
}

function formatMemberSince(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function ProfilHeader({ profil }: Props) {
  const initiale = profil.prenom
    ? profil.prenom[0].toUpperCase()
    : profil.email
    ? profil.email[0].toUpperCase()
    : "?";

  return (
    <div className="flex items-center gap-4 mb-6">
      {profil.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profil.photo_url}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          {initiale}
        </div>
      )}

      <div className="min-w-0">
        <h1
          className="text-2xl leading-tight truncate"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          {profil.prenom || "Mon profil"}
        </h1>
        {profil.email && (
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {profil.email}
          </p>
        )}
        {profil.created_at && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Membre depuis {formatMemberSince(profil.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
