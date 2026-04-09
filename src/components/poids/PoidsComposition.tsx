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
      color: "#3872c4",
      bgColor: "rgba(56,114,196,0.12)",
    };
  if (imc < 25)
    return {
      label: "Normal",
      color: "#2a9d6e",
      bgColor: "rgba(42,157,110,0.12)",
    };
  if (imc < 30)
    return {
      label: "Surpoids",
      color: "#b08a1a",
      bgColor: "rgba(176,138,26,0.12)",
    };
  return {
    label: "Obésité",
    color: "#c94444",
    bgColor: "rgba(201,68,68,0.12)",
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
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 20,
        marginBottom: 14,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 12,
        }}
      >
        Composition
      </div>

      {/* IMC value + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {imc}
        </span>
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 9999,
            color: cat.color,
            background: cat.bgColor,
          }}
        >
          {cat.label}
        </span>
      </div>

      {/* Barre IMC */}
      <div style={{ position: "relative", height: 5, marginBottom: 8 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 99,
            background:
              "linear-gradient(90deg, #3872c4 0%, #2a9d6e 30%, #b08a1a 65%, #c94444 100%)",
          }}
        />
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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["16", "18.5", "25", "30", "40"].map((v) => (
          <span
            key={v}
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 9,
              color: "var(--text-muted)",
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
            gap: 10,
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {bf}%
          </span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 2,
              }}
            >
              Masse grasse (Navy)
            </div>
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 9,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(0,0,0,0.04)",
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
