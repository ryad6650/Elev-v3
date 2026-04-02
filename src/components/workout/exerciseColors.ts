// Couleurs par groupe musculaire — partagées entre les composants workout

const GROUPE_COLORS: Record<string, { bg: string; text: string }> = {
  pectoraux: { bg: "rgba(249,115,22,0.15)", text: "#FB923C" },
  dos: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
  épaules: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
  epaules: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
  biceps: { bg: "rgba(20,184,166,0.15)", text: "#2DD4BF" },
  triceps: { bg: "rgba(236,72,153,0.15)", text: "#F472B6" },
  quadriceps: { bg: "rgba(234,179,8,0.15)", text: "#FACC15" },
  "ischio-jambiers": { bg: "rgba(59,130,246,0.15)", text: "#93C5FD" },
  ischios: { bg: "rgba(59,130,246,0.15)", text: "#93C5FD" },
  fessiers: { bg: "rgba(244,63,94,0.15)", text: "#FB7185" },
  mollets: { bg: "rgba(34,197,94,0.15)", text: "#4ADE80" },
  abdominaux: { bg: "rgba(249,115,22,0.15)", text: "#FB923C" },
  lombaires: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
  "avant-bras": { bg: "rgba(251,146,60,0.15)", text: "#FB923C" },
};

const DEFAULT_COLOR = { bg: "rgba(168,162,158,0.15)", text: "#A8A29E" };

export function getGroupeColor(groupe: string) {
  return GROUPE_COLORS[groupe.toLowerCase()] ?? DEFAULT_COLOR;
}
