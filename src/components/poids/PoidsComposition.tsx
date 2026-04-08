interface Props {
  poids: number | null;
  taille: number | null;
  mensurationsCou: number | null;
  mensurationsTaille: number | null;
}

function categorieIMC(imc: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (imc < 18.5)
    return {
      label: "Insuffisant",
      color: "#6BA3D6",
      bgColor: "rgba(106,182,220,0.15)",
    };
  if (imc < 25)
    return {
      label: "Normal",
      color: "#74BF7A",
      bgColor: "rgba(116,191,122,0.15)",
    };
  if (imc < 30)
    return {
      label: "Surpoids",
      color: "#C8A055",
      bgColor: "rgba(200,160,85,0.15)",
    };
  return {
    label: "Obésité",
    color: "#E87C6A",
    bgColor: "rgba(232,124,106,0.15)",
  };
}

function imcToCursorPct(imc: number): number {
  return Math.min(98, Math.max(2, ((imc - 16) / (40 - 16)) * 100));
}

function calcBF(cou: number, abdo: number, hauteurCm: number): number | null {
  if (abdo <= cou) return null;
  const bf =
    86.01 * Math.log10(abdo - cou) - 70.041 * Math.log10(hauteurCm) + 36.76;
  return Math.round(bf * 10) / 10;
}

export default function PoidsComposition({
  poids,
  taille,
  mensurationsCou,
  mensurationsTaille,
}: Props) {
  if (!poids || !taille) return null;

  const tailleM = taille / 100;
  const imc = Math.round((poids / (tailleM * tailleM)) * 10) / 10;
  const cat = categorieIMC(imc);
  const cursorPct = imcToCursorPct(imc);

  const bf =
    mensurationsCou && mensurationsTaille
      ? calcBF(mensurationsCou, mensurationsTaille, taille)
      : null;

  return (
    <div
      className="mb-2.5"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Indice de masse corporelle
      </div>

      {/* IMC value + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 36,
            color: "var(--text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {imc}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 10,
            marginBottom: 5,
            color: cat.color,
            background: cat.bgColor,
          }}
        >
          {cat.label}
        </span>
      </div>

      {/* Barre IMC + dot — même conteneur pour alignement parfait */}
      <div style={{ position: "relative", height: 6, marginBottom: 16 }}>
        {/* Segments colorés via gradient linéaire */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 3,
            background: [
              `linear-gradient(to right,`,
              `rgba(106,182,220,0.25) 0%,`,
              `rgba(106,182,220,0.25) ${(2.5 / 24) * 100}%,`,
              `transparent ${(2.5 / 24) * 100}%,`,
              `transparent calc(${(2.5 / 24) * 100}% + 1px),`,
              `rgba(74,155,84,0.3) calc(${(2.5 / 24) * 100}% + 1px),`,
              `rgba(74,155,84,0.3) ${(9 / 24) * 100}%,`,
              `transparent ${(9 / 24) * 100}%,`,
              `transparent calc(${(9 / 24) * 100}% + 1px),`,
              `rgba(200,160,85,0.25) calc(${(9 / 24) * 100}% + 1px),`,
              `rgba(200,160,85,0.25) ${(14 / 24) * 100}%,`,
              `transparent ${(14 / 24) * 100}%,`,
              `transparent calc(${(14 / 24) * 100}% + 1px),`,
              `rgba(232,124,106,0.25) calc(${(14 / 24) * 100}% + 1px),`,
              `rgba(232,124,106,0.25) 100%)`,
            ].join(" "),
          }}
        />
        {/* Dot — positionné dans le même conteneur */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${cursorPct}%`,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#FAFAF9",
            border: `2px solid ${cat.color}`,
            boxShadow: `0 0 8px ${cat.color}80`,
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* Bar labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {["16", "18.5", "25", "30", "40"].map((v) => (
          <span
            key={v}
            style={{
              fontSize: 7,
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.03em",
            }}
          >
            {v}
          </span>
        ))}
      </div>

      {/* Masse grasse */}
      {bf !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {bf}%
          </span>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                marginBottom: 2,
              }}
            >
              Masse grasse (Navy)
            </div>
            <span
              style={{
                fontSize: 8,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: "var(--bg-card)",
                color: "var(--text-muted)",
              }}
            >
              ESTIMÉ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
