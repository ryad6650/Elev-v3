/**
 * Calculs purs de couleurs d'accent — utilisable côté serveur ET client.
 * Aucune dépendance DOM.
 */

// ─── Utilitaires couleur ────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100,
    ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function mix(a: string, b: string, t: number): string {
  const pa = a.replace("#", ""),
    pb = b.replace("#", "");
  const ch = (hex: string, o: number) => parseInt(hex.substring(o, o + 2), 16);
  const m = (o: number) =>
    Math.round(ch(pa, o) + (ch(pb, o) - ch(pa, o)) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${m(0)}${m(2)}${m(4)}`;
}

// ─── Dérivations ────────────────────────────────────────────

export function deriveSecondary(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex((h + 35) % 360, Math.min(s + 5, 100), l);
}

function deriveHover(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, Math.min(s + 5, 100), Math.max(l - 10, 5));
}

function deriveText(hex: string, isDark: boolean): string {
  const [h, s, l] = hexToHsl(hex);
  if (isDark) return hslToHex(h, Math.min(s + 10, 100), Math.min(l + 25, 88));
  return hslToHex(h, Math.min(s + 10, 100), Math.max(l - 20, 18));
}

// ─── Gradients ──────────────────────────────────────────────

function buildGradients(
  primary: string,
  secondary: string,
  balance: number,
  isDark: boolean,
) {
  const b = balance;
  const fade = 15;
  const pEnd = Math.max(b - fade, 0);
  const sStart = Math.min(b + fade, 100);
  const firstColor = b > 0 ? primary : secondary;
  const darkStart = mix("#000000", firstColor, 0.4);
  const workoutGrad =
    b === 100
      ? `linear-gradient(135deg, ${darkStart} 0%, ${primary} 12%, ${primary} 100%)`
      : b === 0
        ? `linear-gradient(135deg, ${darkStart} 0%, ${secondary} 12%, ${secondary} 100%)`
        : `linear-gradient(135deg, ${darkStart} 0%, ${primary} 10%, ${primary} ${pEnd}%, ${secondary} ${sStart}%, ${secondary} 100%)`;

  const bgBase = isDark ? "#1c1917" : "#f0eeeb";
  const sleepGrad = `linear-gradient(135deg, ${mix(bgBase, primary, isDark ? 0.1 : 0.08)} 0%, ${bgBase} 70%)`;
  const lineGrad = `linear-gradient(to right, ${primary} 0%, ${secondary} ${60 + b * 0.4}%, transparent 100%)`;
  const mondayBg = `linear-gradient(135deg, ${primary}22 0%, ${mix(bgBase, secondary, 0.06)} 100%)`;

  return { workoutGrad, sleepGrad, lineGrad, mondayBg };
}

// ─── CSS string generation (serveur-compatible) ─────────────

export interface AccentParams {
  primary: string;
  secondary: string | null;
  balance: number;
  isDark: boolean;
}

/** Retourne les déclarations CSS custom properties pour les couleurs accent */
export function computeAccentCSS(p: AccentParams): string {
  const { primary, balance, isDark } = p;
  const sec = p.secondary ?? deriveSecondary(primary);
  const g = buildGradients(primary, sec, balance, isDark);

  return [
    `--accent:${primary}`,
    `--accent-hover:${deriveHover(primary)}`,
    `--accent-bg:${primary}26`,
    `--accent-text:${deriveText(primary, isDark)}`,
    `--accent-secondary:${sec}`,
    `--grad-workout:${g.workoutGrad}`,
    `--grad-btn-accent:${g.workoutGrad}`,
    `--grad-sleep:${g.sleepGrad}`,
    `--grad-header-line:${g.lineGrad}`,
    `--grad-monday:${g.mondayBg}`,
  ].join(";");
}
