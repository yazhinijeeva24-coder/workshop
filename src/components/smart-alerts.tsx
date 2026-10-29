"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  OctagonAlert,
  AlertTriangle,
  ShieldCheck,
  PiggyBank,
  Telescope,
  TrendingUp,
  TrendingDown,
  Crown,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  formatMoney,
  getCategory,
  isSameDay,
} from "@/lib/categories";
import type { ExpenseRecord } from "./quick-add";

type AlertTone = "danger" | "warn" | "good" | "info";

type Alert = {
  tone: AlertTone;
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
};

type Insight = {
  tone: AlertTone;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
};

const TONE_STYLES: Record<AlertTone, string> = {
  danger:
    "bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200",
  warn: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200",
  good: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200",
  info: "bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-950/50 dark:border-teal-800 dark:text-teal-200",
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function SmartAlerts({
  expenses,
  viewMonthKey,
  isCurrentMonth,
  monthTotal,
  budget,
  currencySymbol,
  daysLeft,
  daysInMonth,
  onSetBudget,
}: {
  expenses: ExpenseRecord[];
  viewMonthKey: string;
  isCurrentMonth: boolean;
  monthTotal: number;
  budget: number | null;
  currencySymbol: string;
  daysLeft: number;
  daysInMonth: number;
  onSetBudget: () => void;
}) {
  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = [];
    if (!isCurrentMonth) return list;

    if (budget !== null && monthTotal > 0) {
      const used = (monthTotal / budget) * 100;
      if (monthTotal > budget) {
        list.push({
          tone: "danger",
          icon: <OctagonAlert className="h-5 w-5 shrink-0" />,
          title: `Over budget by ${formatMoney(monthTotal - budget, currencySymbol)}`,
          body: `You've used ${Math.round(used)}% of your monthly budget. Pause non-essentials or reset a realistic budget.`,
        });
      } else if (used >= 80) {
        list.push({
          tone: "warn",
          icon: <AlertTriangle className="h-5 w-5 shrink-0" />,
          title: `${Math.round(used)}% of budget used`,
          body: `${formatMoney(budget - monthTotal, currencySymbol)} left with ${daysLeft} day${daysLeft === 1 ? "" : "s"} to go — roughly ${formatMoney(Math.max(0, budget - monthTotal) / daysLeft, currencySymbol)}/day.`,
        });
      } else {
        list.push({
          tone: "good",
          icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
          title: `On track — ${Math.round(used)}% of budget used`,
          body: `${formatMoney(budget - monthTotal, currencySymbol)} still available. Keep the two-second habit going!`,
        });
      }
    } else if (budget === null && monthTotal > 0) {
      list.push({
        tone: "info",
        icon: <PiggyBank className="h-5 w-5 shrink-0" />,
        title: "Unlock your Budget Guard",
        body: "Set a monthly budget to get overspend alerts, safe-to-spend per day and a month-end projection.",
        action: { label: "Set budget", onClick: onSetBudget },
      });
    }

    return list;
  }, [isCurrentMonth, budget, monthTotal, daysLeft, currencySymbol, onSetBudget]);

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const now = new Date();

    // Month-end projection (only meaningful for the live month with ≥2 days of history)
    const daysElapsed = now.getDate();
    if (isCurrentMonth && monthTotal > 0 && daysElapsed >= 2) {
      const projected = (monthTotal / daysElapsed) * daysInMonth;
      if (budget !== null) {
        const over = projected > budget;
        list.push({
          tone: over ? "danger" : "good",
          icon: <Telescope className="h-5 w-5" />,
          label: "Month-end projection",
          value: formatMoney(projected, currencySymbol),
          sub: over
            ? `at this pace you'd be ${formatMoney(projected - budget, currencySymbol)} over budget`
            : `at this pace you'd stay ${formatMoney(budget - projected, currencySymbol)} under budget`,
        });
      } else {
        list.push({
          tone: "info",
          icon: <Telescope className="h-5 w-5" />,
          label: "Month-end projection",
          value: formatMoney(projected, currencySymbol),
          sub: `spending ${formatMoney(monthTotal / daysElapsed, currencySymbol)}/day so far`,
        });
      }
    }

    // Week vs previous week
    const today = startOfDay(now);
    let last7 = 0;
    let prev7 = 0;
    for (const e of expenses) {
      const d = startOfDay(new Date(e.date));
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff <= 6) last7 += e.amount;
      else if (diff >= 7 && diff <= 13) prev7 += e.amount;
    }
    if (prev7 > 0 || last7 > 0) {
      if (prev7 === 0) {
        list.push({
          tone: "warn",
          icon: <TrendingUp className="h-5 w-5" />,
          label: "This week",
          value: formatMoney(last7, currencySymbol),
          sub: "new spending week — no comparison yet",
        });
      } else {
        const delta = ((last7 - prev7) / prev7) * 100;
        const up = delta > 0;
        list.push({
          tone: up ? "warn" : "good",
          icon: up ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
          label: "This week vs last",
          value: `${up ? "+" : ""}${Math.round(delta)}%`,
          sub: `${formatMoney(last7, currencySymbol)} vs ${formatMoney(prev7, currencySymbol)} — ${up ? "spending is up" : "you're saving"}`,
        });
      }
    }

    // Biggest expense of viewed month
    const monthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === viewMonthKey;
    });
    const biggest = monthExpenses.reduce<ExpenseRecord | null>(
      (max, e) => (!max || e.amount > max.amount ? e : max),
      null
    );
    if (biggest) {
      const cat = getCategory(biggest.category);
      list.push({
        tone: "info",
        icon: <Crown className="h-5 w-5" />,
        label: "Biggest expense",
        value: formatMoney(biggest.amount, currencySymbol),
        sub: `${cat.emoji} ${biggest.note || cat.label} · ${new Date(biggest.date).toLocaleDateString("en", { day: "numeric", month: "short" })}`,
      });
    }

    // Top-category tip
    if (monthExpenses.length >= 3 && monthTotal > 0) {
      const totals = new Map<string, number>();
      for (const e of monthExpenses) {
        totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
      }
      let topId = "";
      let topAmt = 0;
      for (const [id, amt] of totals) {
        if (amt > topAmt) {
          topAmt = amt;
          topId = id;
        }
      }
      const share = Math.round((topAmt / monthTotal) * 100);
      if (share >= 40) {
        const cat = getCategory(topId);
        list.push({
          tone: "info",
          icon: <Lightbulb className="h-5 w-5" />,
          label: "Smart tip",
          value: `${share}% on ${cat.label}`,
          sub: `${cat.emoji} dominates this month — trimming it even 10% adds real savings`,
        });
      }
    }

    return list;
  }, [expenses, viewMonthKey, monthTotal, budget, currencySymbol, isCurrentMonth, daysInMonth]);

  const hasAnyData = expenses.length > 0;

  if (!hasAnyData) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <span className="font-semibold">Welcome aboard!</span> Add your first
          expense above and this space will fill with live alerts, projections
          and smart money tips.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 rounded-xl border-l-4 border p-4 ${TONE_STYLES[a.tone]}`}
              role="status"
            >
              {a.icon}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold tracking-tight">{a.title}</p>
                <p className="mt-0.5 opacity-90">{a.body}</p>
              </div>
              {a.action && (
                <button
                  type="button"
                  onClick={a.action.onClick}
                  className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  {a.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {insights.map((ins) => (
            <div
              key={ins.label}
              className={`rounded-xl border-l-4 border p-3.5 sm:p-4 ${TONE_STYLES[ins.tone]}`}
            >
              <div className="flex items-center gap-2">
                {ins.icon}
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                  {ins.label}
                </span>
              </div>
              <p className="mt-2 truncate text-lg font-bold tracking-tight sm:text-xl">
                {ins.value}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs opacity-90">{ins.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
