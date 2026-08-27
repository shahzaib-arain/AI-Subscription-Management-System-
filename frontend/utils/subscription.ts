// Shared subscription-status/cycle presentation — used by the subscriptions
// list, the detail screen, and the home dashboard so a status always reads
// the same color and label everywhere it appears.

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#14ed9e",
  PAUSED: "#ffd11a",
  FLAGGED: "#f52222",
  CANCELLED: "#7e828d",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#7e828d";
}

export function statusLabel(status: string): string {
  if (!status) return "";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const CYCLE_SUFFIXES: Record<string, string> = {
  WEEKLY: "wk",
  MONTHLY: "mo",
  YEARLY: "yr",
};

export function cycleSuffix(cycle: string): string {
  return CYCLE_SUFFIXES[cycle] ?? cycle.toLowerCase();
}

export function cycleLabel(cycle: string): string {
  return statusLabel(cycle);
}

/** A generic stand-in for merchants the backend hasn't matched a logo for. */
export const FALLBACK_MERCHANT_EMOJI = "💳";

const CYCLE_TO_MONTHLY_FACTOR: Record<string, number> = {
  WEEKLY: 52 / 12,
  MONTHLY: 1,
  YEARLY: 1 / 12,
};

/** Normalizes any billing cycle to a monthly-equivalent cost, for totals that mix cycles. */
export function monthlyEquivalent(amount: number, cycle: string): number {
  return amount * (CYCLE_TO_MONTHLY_FACTOR[cycle] ?? 1);
}
