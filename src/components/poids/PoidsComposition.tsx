interface Props {
  poids: number | null;
  taille: number | null;
  mensurationsCou: number | null;
  mensurationsTaille: number | null;
}

function categorieIMC(imc: number): { label: string; color: string; bgColor: string } {
  if (imc < 18.5) return { label: "Insuffisant", color: "#5B9BF5", bgColor: "rgba(91,155,245,0.15)" };
  if (imc < 25)   return { label: "✓ Normal", color: "#4ADE80", bgColor: "rgba(74,222,128,0.15)" };
  if (imc < 30)   return { label: "Surpoids", color: "#F5A623", bgColor: "rgba(245,166,35,0.15)" };
  return { label: "Obésité", color: "#EF4444", bgColor: "rgba(239,68,68,0.15)" };
}

function imcToCursorPct(imc: number): number {
  // Échelle visuelle : 16 = 0%, 40 = 100%
  return Math.min(98, Math.max(2, ((imc - 16) / (40 - 16)) * 100));
}

function calcBF(cou: number, abdo: number, hauteurCm: number): number | null {
  // Formule Navy (hommes) : BF = 86.01 × log10(abdo - cou) - 70.041 × log10(hauteur_cm) + 36.76
  if (abdo <= cou) return null;
  const bf = 86.01 * Math.log10(abdo - cou) - 70.041 * Math.log10(hauteurCm) + 36.76;
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
      className="rounded-2xl mb-3"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        padding: 18,
      }}
    >
      {/* Titre */}
      <div
        className="font-semibold uppercase mb-3.5"
        style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "0.07em" }}
      >
        Composition
      </div>

      {/* Ligne IMC */}
      <div className="flex items-center gap-3 mb-3.5">
        <div
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {imc}
        </div>
        <div className="flex-1">
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>
            IMC (kg/m²)
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-full font-bold"
            style={{
              fontSize: "0.65rem",
              padding: "3px 9px",
              background: cat.bgColor,
              color: cat.color,
            }}
          >
            {cat.label}
          </div>
        </div>
      </div>

      {/* Barre IMC gradient */}
      <div className="mb-1.5">
        <div
          className="relative rounded-full mb-1"
          style={{
            height: 6,
            background:
              "linear-gradient(90deg, #5B9BF5 0%, #4ADE80 28%, #F5A623 52%, #E8860C 72%, #9b1c1c 100%)",
          }}
        >
          <div
            className="absolute rounded-full border-2 bg-white"
            style={{
              width: 10,
              height: 10,
              top: "50%",
              left: `${cursorPct}%`,
              transform: "translate(-50%, -50%)",
              borderColor: "var(--text-primary)",
            }}
          />
        </div>
        <div
          className="flex justify-between"
          style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}
        >
          <span>16</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      {/* Ligne masse grasse */}
      {bf !== null && (
        <div
          className="flex items-center gap-3 mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {bf}%
          </div>
          <div className="flex-1">
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>
              Masse grasse (Navy)
            </div>
            <div
              className="inline-flex items-center gap-1 rounded-full"
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                padding: "3px 9px",
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              Estimé
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
