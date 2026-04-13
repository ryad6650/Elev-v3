import { describe, it, expect, vi, afterEach } from "vitest";
import { computeStreak } from "@/lib/date-utils";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("computeStreak", () => {
  afterEach(() => vi.useRealTimers());

  it("retourne 0 si aucune date", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("retourne 1 si activité aujourd'hui seulement", () => {
    expect(computeStreak([dateStr(0)])).toBe(1);
  });

  it("retourne 1 si activité hier seulement", () => {
    expect(computeStreak([dateStr(1)])).toBe(1);
  });

  it("retourne 0 si activité avant-hier sans hier ni aujourd'hui", () => {
    expect(computeStreak([dateStr(2)])).toBe(0);
  });

  it("compte les jours consécutifs depuis aujourd'hui", () => {
    const dates = [dateStr(0), dateStr(1), dateStr(2), dateStr(3)];
    expect(computeStreak(dates)).toBe(4);
  });

  it("compte les jours consécutifs depuis hier", () => {
    const dates = [dateStr(1), dateStr(2), dateStr(3)];
    expect(computeStreak(dates)).toBe(3);
  });

  it("s'arrête au premier trou", () => {
    // aujourd'hui, hier, avant-hier, trou, il y a 4 jours
    const dates = [dateStr(0), dateStr(1), dateStr(2), dateStr(4)];
    expect(computeStreak(dates)).toBe(3);
  });

  it("gère les doublons sans compter double", () => {
    const dates = [dateStr(0), dateStr(0), dateStr(1), dateStr(1)];
    expect(computeStreak(dates)).toBe(2);
  });

  it("gère les dates non triées", () => {
    const dates = [dateStr(2), dateStr(0), dateStr(1)];
    expect(computeStreak(dates)).toBe(3);
  });
});
