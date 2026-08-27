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

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f52222",
  Music: "#14ed9e",
  Cloud: "#ffb020",
  Design: "#a96df5",
  "AI Tools": "#4e83ff",
  Storage: "#2dd4bf",
};
const CATEGORY_FALLBACK_COLORS = ["#f57f9e", "#7ee787", "#f5a623", "#6ee7f5"];

/** Deterministic color per category — same category always reads the same color across screens. */
export function categoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return CATEGORY_FALLBACK_COLORS[hash % CATEGORY_FALLBACK_COLORS.length];
}

const CYCLE_TO_MONTHLY_FACTOR: Record<string, number> = {
  WEEKLY: 52 / 12,
  MONTHLY: 1,
  YEARLY: 1 / 12,
};

/** Normalizes any billing cycle to a monthly-equivalent cost, for totals that mix cycles. */
export function monthlyEquivalent(amount: number, cycle: string): number {
  return amount * (CYCLE_TO_MONTHLY_FACTOR[cycle] ?? 1);
}

export interface SpendSummary {
  activeCount: number;
  totalMonthly: number;
  savedThisMonth: number;
}

/**
 * The one place "how much am I spending / saving" gets computed — reused by
 * the Home dashboard and the Profile screen so the two numbers can never
 * quietly drift apart.
 */
export function computeSpendSummary(subscriptions: { status: string; amount: number; billingCycle: string }[]): SpendSummary {
  const active = subscriptions.filter((s) => s.status === "ACTIVE" || s.status === "FLAGGED");
  const inactive = subscriptions.filter((s) => s.status === "PAUSED" || s.status === "CANCELLED");

  return {
    activeCount: active.length,
    totalMonthly: active.reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.billingCycle), 0),
    savedThisMonth: inactive.reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.billingCycle), 0),
  };
}
