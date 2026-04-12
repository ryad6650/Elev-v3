import Link from "next/link";
import Image from "next/image";

function formatDateFr(): string {
  return new Date()
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
}

interface Props {
  prenom: string;
  seancesCetteSemaine: number;
  photoUrl: string | null;
}

export default function DashboardHeader({
  prenom,
  seancesCetteSemaine,
  photoUrl,
}: Props) {
  const restantes = Math.max(0, 5 - seancesCetteSemaine);
  const subtitle =
    restantes > 0
      ? `Encore ${restantes} seance${restantes > 1 ? "s" : ""} cette semaine 💪`
      : "Objectif semaine atteint ! 💪";

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="flex items-start justify-between">
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            {formatDateFr()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontStyle: "italic",
              fontSize: 46,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.15,
            }}
          >
            Bonjour,
            <br />
            {prenom}
          </div>
        </div>

        <Link
          href="/profil"
          className="shrink-0 flex items-center justify-center rounded-full overflow-hidden"
          style={{
            width: 48,
            height: 48,
            background: "rgba(5,137,214,0.1)",
            border: "1.5px solid rgba(5,137,214,0.25)",
            marginTop: 4,
          }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="Profil"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#74BF7A",
              }}
            >
              {prenom[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </Link>
      </div>

      <div
        style={{
          fontSize: 18,
          color: "var(--text-secondary)",
          marginTop: 8,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}
