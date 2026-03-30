export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

export function getNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export function computeStreak(activityDates: string[]): number {
  const dateSet = new Set(activityDates);
  const cursor = new Date();
  let streak = 0;
  if (!dateSet.has(getTodayString())) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (!dateSet.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
