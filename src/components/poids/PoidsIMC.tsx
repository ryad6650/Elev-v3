interface Props {
  poids: number | null;
  taille: number | null;
}

function categorieIMC(imc: number): { label: string; color: string } {
  if (imc < 18.5)
    return { label: "Insuffisance pondérale", color: "var(--color-carbs)" };
  if (imc < 25)
    return { label: "Poids normal", color: "var(--success)" };
  if (imc < 30)
    return { label: "Surpoids", color: "var(--color-carbs)" };
  return { label: "Obésité", color: "var(--danger)" };
}

export default function PoidsIMC({ poids, taille }: Props) {
  if (!poids || !taille) return null;

  const tailleM = taille / 100;
  const imc = Math.round((poids / (tailleM * tailleM)) * 10) / 10;
  const cat = categorieIMC(imc);

  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        IMC — Indice de Masse Corporelle
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-3xl font-bold"
            style={{ color: "var(--accent-text)" }}
          >
            {imc}
          </span>
          <span
            className="text-sm ml-1"
            style={{ color: "var(--text-secondary)" }}
          >
            kg/m²
          </span>
        </div>
        <span
          className="text-sm font-medium px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-card)", color: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        Basé sur {poids} kg · {taille} cm
      </p>
    </div>
  );
}
