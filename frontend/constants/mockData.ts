export interface Subscription {
  id: string;
  name: string;
  logo: string;
  amount: number;
  currency: string;
  cycle: "monthly" | "yearly" | "weekly";
  nextPayment: string;
  status: "active" | "paused" | "flagged";
  category: string;
  color: string;
}

export interface Alert {
  id: string;
  type: "price_increase" | "fraud" | "unused" | "new_detected";
  title: string;
  description: string;
  subscription: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  type: "payment" | "detected" | "paused" | "alert";
  title: string;
  amount?: number;
  timestamp: string;
  icon: string;
}

export const subscriptions: Subscription[] = [
  { id: "1", name: "Netflix", logo: "🎬", amount: 15.99, currency: "USD", cycle: "monthly", nextPayment: "2026-04-28", status: "active", category: "Entertainment", color: "hsl(0 72% 55%)" },
  { id: "2", name: "Spotify", logo: "🎵", amount: 9.99, currency: "USD", cycle: "monthly", nextPayment: "2026-05-01", status: "active", category: "Music", color: "hsl(142 70% 45%)" },
  { id: "3", name: "AWS", logo: "☁️", amount: 124.50, currency: "USD", cycle: "monthly", nextPayment: "2026-04-30", status: "active", category: "Cloud", color: "hsl(30 90% 55%)" },
  { id: "4", name: "Adobe CC", logo: "🎨", amount: 54.99, currency: "USD", cycle: "monthly", nextPayment: "2026-05-05", status: "flagged", category: "Design", color: "hsl(270 80% 65%)" },
  { id: "5", name: "ChatGPT Plus", logo: "🤖", amount: 20.00, currency: "USD", cycle: "monthly", nextPayment: "2026-05-10", status: "active", category: "AI Tools", color: "hsl(160 84% 50%)" },
  { id: "6", name: "Figma", logo: "✏️", amount: 15.00, currency: "USD", cycle: "monthly", nextPayment: "2026-05-12", status: "paused", category: "Design", color: "hsl(270 60% 55%)" },
  { id: "7", name: "iCloud+", logo: "🍎", amount: 2.99, currency: "USD", cycle: "monthly", nextPayment: "2026-04-20", status: "active", category: "Storage", color: "hsl(210 80% 60%)" },
  { id: "8", name: "GitHub Pro", logo: "💻", amount: 4.00, currency: "USD", cycle: "monthly", nextPayment: "2026-05-15", status: "active", category: "Dev Tools", color: "hsl(0 0% 50%)" },
];

export const alerts: Alert[] = [
  { id: "1", type: "price_increase", title: "Price increase detected", description: "Adobe CC increased from $49.99 to $54.99/mo — a 10% hike.", subscription: "Adobe CC", severity: "high", timestamp: "2h ago", read: false },
  { id: "2", type: "fraud", title: "Suspicious charge detected", description: "An unknown merchant 'XZMedia' charged $29.99 as a recurring payment.", subscription: "Unknown", severity: "high", timestamp: "5h ago", read: false },
  { id: "3", type: "unused", title: "Unused subscription", description: "You haven't used Figma in 45 days. Consider pausing to save $15/mo.", subscription: "Figma", severity: "medium", timestamp: "1d ago", read: true },
  { id: "4", type: "new_detected", title: "New subscription detected", description: "AI detected a new recurring charge from ChatGPT Plus ($20/mo).", subscription: "ChatGPT Plus", severity: "low", timestamp: "3d ago", read: true },
];

export const activities: ActivityItem[] = [
  { id: "1", type: "payment", title: "Netflix payment processed", amount: 15.99, timestamp: "Today, 9:00 AM", icon: "🎬" },
  { id: "2", type: "alert", title: "Adobe CC price increase flagged", timestamp: "Today, 7:30 AM", icon: "⚠️" },
  { id: "3", type: "detected", title: "AI detected ChatGPT Plus subscription", timestamp: "Yesterday, 3:15 PM", icon: "🤖" },
  { id: "4", type: "payment", title: "Spotify payment processed", amount: 9.99, timestamp: "Yesterday, 12:00 PM", icon: "🎵" },
  { id: "5", type: "paused", title: "Figma subscription paused", timestamp: "Apr 10, 2:30 PM", icon: "✏️" },
  { id: "6", type: "payment", title: "AWS payment processed", amount: 124.50, timestamp: "Apr 10, 9:00 AM", icon: "☁️" },
];

export const totalMonthly = subscriptions
  .filter((s) => s.status === "active")
  .reduce((sum, s) => sum + s.amount, 0);
