/** Formater une date locale en YYYY-MM-DD (fuseau utilisateur) */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayString(): string {
  return toLocalDateString(new Date());
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  now.setDate(diff);
  return toLocalDateString(now);
}

export function getNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
}

export function computeStreak(activityDates: string[]): number {
  const dateSet = new Set(activityDates);
  const cursor = new Date();
  let streak = 0;
  if (!dateSet.has(getTodayString())) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const dateStr = toLocalDateString(cursor);
    if (!dateSet.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
