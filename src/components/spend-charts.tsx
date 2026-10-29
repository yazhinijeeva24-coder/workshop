"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCategory, formatMoney, isSameDay } from "@/lib/categories";
import type { ExpenseRecord } from "./quick-add";

export function SpendCharts({
  expenses,
  currencySymbol,
  viewMonthKey,
  monthLabel,
}: {
  expenses: ExpenseRecord[];
  currencySymbol: string;
  viewMonthKey: string;
  monthLabel: string;
}) {
  // Category share for the viewed month
  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key !== viewMonthKey) continue;
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(totals.entries())
      .map(([id, value]) => ({
        id,
        name: getCategory(id).label,
        emoji: getCategory(id).emoji,
        value: Math.round(value * 100) / 100,
        color: getCategory(id).color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, viewMonthKey]);

  const monthTotal = byCategory.reduce((s, c) => s + c.value, 0);

  // Last 14 days trend
  const trend = useMemo(() => {
    const now = new Date();
    const buckets: { date: Date; label: string; amount: number; isToday: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({
        date: d,
        label: d.toLocaleDateString("en", { day: "numeric", month: "short" }),
        amount: 0,
        isToday: i === 0,
      });
    }
    for (const e of expenses) {
      const ed = new Date(e.date);
      const bucket = buckets.find((b) => isSameDay(b.date, ed));
      if (bucket) bucket.amount += e.amount;
    }
    return buckets.map((b) => ({
      label: b.label,
      isToday: b.isToday,
      amount: Math.round(b.amount * 100) / 100,
    }));
  }, [expenses]);

  const empty = byCategory.length === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2 border-emerald-200/60 dark:border-emerald-900/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Where it went</CardTitle>
          <CardDescription>Category split for {monthLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <span className="text-3xl">🍩</span>
              Your category chart blooms once you add expenses for {monthLabel}.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {byCategory.map((c) => (
                        <Cell key={c.id} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatMoney(value, currencySymbol),
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">
                    {formatMoney(monthTotal, currencySymbol)}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
                {byCategory.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">
                      {c.emoji} {c.name}
                    </span>
                    <span className="ml-auto font-medium">{Math.round((c.value / monthTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-emerald-200/60 dark:border-emerald-900/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">14-day rhythm</CardTitle>
          <CardDescription>Daily spending over the last two weeks</CardDescription>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <span className="text-3xl">📈</span>
              Log a few expenses and watch your spending rhythm appear here.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    formatter={(value: number) => [formatMoney(value, currencySymbol), "Spent"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 13,
                    }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {trend.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.isToday ? "#059669" : "#5eead4"}
                        fillOpacity={d.isToday ? 1 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
