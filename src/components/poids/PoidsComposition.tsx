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
      style={{
        padding: "14px 0",
        borderBottom: "1px solid rgba(74,55,40,0.08)",
        marginBottom: 6,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Indice de masse corporelle
      </div>

      {/* IMC value + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 32,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {imc}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
            color: cat.color,
            background: cat.bgColor,
          }}
        >
          {cat.label}
        </span>
      </div>

      {/* Barre IMC gradient continu */}
      <div style={{ position: "relative", height: 5, marginBottom: 6 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 99,
            background:
              "linear-gradient(90deg, #6BA3D6 0%, #74BF7A 30%, #C8A055 65%, #E87C6A 100%)",
          }}
        />
        {/* Curseur */}
        <div
          style={{
            position: "absolute",
            top: -4,
            left: `${cursorPct}%`,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#fff",
            border: `2.5px solid ${cat.color}`,
            boxShadow: `0 0 6px ${cat.color}66`,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Échelle */}
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
              color: "var(--text-secondary)",
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
            borderTop: "1px solid rgba(74,55,40,0.06)",
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
                background: "rgba(74,55,40,0.06)",
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
