/** Validation côté serveur — utilisé dans les Server Actions */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDate(date: string): void {
  if (!ISO_DATE.test(date) || isNaN(new Date(date + "T00:00:00").getTime())) {
    throw new Error("Date invalide (format attendu : YYYY-MM-DD)");
  }
}

export function validateWeight(poids: number): void {
  if (!Number.isFinite(poids) || poids < 0 || poids > 500) {
    throw new Error("Poids invalide (0–500 kg)");
  }
}

export function validateCalories(cal: number): void {
  if (!Number.isFinite(cal) || cal < 0 || cal > 15000) {
    throw new Error("Calories invalides (0–15 000)");
  }
}

export function validateMealNumber(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    throw new Error("Numéro de repas invalide (1–6)");
  }
}

export function validateQuantity(g: number): void {
  if (!Number.isFinite(g) || g < 0 || g > 5000) {
    throw new Error("Quantité invalide (0–5 000 g)");
  }
}

export function validateHeight(cm: number): void {
  if (!Number.isFinite(cm) || cm < 50 || cm > 300) {
    throw new Error("Taille invalide (50–300 cm)");
  }
}

export function validateMacro(val: number): void {
  if (!Number.isFinite(val) || val < 0 || val > 2000) {
    throw new Error("Valeur macro invalide (0–2 000 g)");
  }
}
