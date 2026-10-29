"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatMoney, getCategory } from "@/lib/categories";
import {
  Wallet,
  CalendarClock,
  Compass,
  Sun,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
};

export function StatsCards({
  monthTotal,
  dayAvg,
  topCategory,
  txCount,
  spentToday,
  currencySymbol,
  monthLabel,
  isCurrentMonth,
}: {
  monthTotal: number;
  dayAvg: number;
  topCategory: string | null;
  txCount: number;
  spentToday: number;
  currencySymbol: string;
  monthLabel: string;
  isCurrentMonth: boolean;
}) {
  const cat = topCategory ? getCategory(topCategory) : null;

  const stats: Stat[] = [
    {
      label: isCurrentMonth ? "This month" : monthLabel,
      value: formatMoney(monthTotal, currencySymbol),
      sub: `${txCount} expense${txCount === 1 ? "" : "s"} logged`,
      icon: <Wallet className="h-5 w-5" />,
      accent: "bg-emerald-600",
    },
    {
      label: "Daily average",
      value: formatMoney(dayAvg, currencySymbol),
      sub: "for days that had spending",
      icon: <CalendarClock className="h-5 w-5" />,
      accent: "bg-teal-600",
    },
    {
      label: "Spent today",
      value: formatMoney(spentToday, currencySymbol),
      sub:
        spentToday === 0
          ? "clean day so far — nice!"
          : "logged since midnight",
      icon: <Sun className="h-5 w-5" />,
      accent: "bg-rose-500",
    },
    {
      label: "Top category",
      value: cat ? `${cat.emoji} ${cat.label}` : "—",
      sub: cat
        ? "where most of your money went"
        : "add expenses to see patterns",
      icon: <Compass className="h-5 w-5" />,
      accent: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="border-emerald-200/60 dark:border-emerald-900/50 shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${s.accent}`}
              >
                {s.icon}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                {s.label}
              </span>
            </div>
            <p className="mt-2.5 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {s.value}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
