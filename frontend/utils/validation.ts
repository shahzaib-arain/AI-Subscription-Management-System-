// Shared, live-typing validation helpers used across the auth screens so
// every field is checked the moment the user types, not only on submit.

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s+/g, ""));
}

export type PasswordStrengthLevel = 1 | 2 | 3;

export interface PasswordStrength {
  score: PasswordStrengthLevel;
  label: "Weak" | "Medium" | "Strong";
  color: string;
}

/**
 * Purely informational — never blocks submission. Any password long enough
 * to pass MIN_PASSWORD_LENGTH is accepted; this just tells the user how
 * guessable it is so they can choose to strengthen it themselves.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let points = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 1) return { score: 1, label: "Weak", color: "#f52222" };
  if (points <= 3) return { score: 2, label: "Medium", color: "#ffd11a" };
  return { score: 3, label: "Strong", color: "#14ed9e" };
}
