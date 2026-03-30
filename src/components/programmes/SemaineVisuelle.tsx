'use client';

const JOURS = [
  { lettre: 'L', label: 'Lun' },
  { lettre: 'M', label: 'Mar' },
  { lettre: 'M', label: 'Mer' },
  { lettre: 'J', label: 'Jeu' },
  { lettre: 'V', label: 'Ven' },
  { lettre: 'S', label: 'Sam' },
  { lettre: 'D', label: 'Dim' },
];

interface Props {
  joursActifs: number[];
  interactive?: boolean;
  onToggle?: (jour: number) => void;
}

export default function SemaineVisuelle({ joursActifs, interactive = false, onToggle }: Props) {
  return (
    <div className="flex justify-between gap-1.5">
      {JOURS.map(({ lettre, label }, index) => {
        const actif = joursActifs.includes(index);
        return (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <button
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onToggle?.(index)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: actif ? 'var(--accent)' : 'var(--bg-elevated)',
                color: actif ? '#fff' : 'var(--text-muted)',
                cursor: interactive ? 'pointer' : 'default',
                transform: 'scale(1)',
              }}
            >
              {lettre}
            </button>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
