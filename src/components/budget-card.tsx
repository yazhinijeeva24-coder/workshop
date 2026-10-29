"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatMoney } from "@/lib/categories";
import { PiggyBank, ShieldCheck, AlertTriangle, OctagonAlert, Loader2, Pencil } from "lucide-react";

export function BudgetCard({
  budget,
  monthSpent,
  currencySymbol,
  monthLabel,
  daysLeft,
  onSaved,
}: {
  budget: number | null;
  monthSpent: number;
  currencySymbol: string;
  monthLabel: string;
  daysLeft: number;
  onSaved: (amount: number | null) => void;
}) {
  const [editing, setEditing] = useState(budget === null);
  const [value, setValue] = useState(budget ? String(budget) : "");
  const [saving, setSaving] = useState(false);

  async function save(amount: number) {
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Could not save budget");
      onSaved(amount);
      setEditing(false);
      toast.success(`Monthly budget set to ${formatMoney(amount, currencySymbol)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid budget amount");
      return;
    }
    save(amount);
  }

  const used = budget ? Math.min(100, (monthSpent / budget) * 100) : 0;
  const remaining = budget ? budget - monthSpent : 0;
  const safePerDay = budget && daysLeft > 0 ? Math.max(0, remaining) / daysLeft : remaining;
  const status: "safe" | "warn" | "over" =
    budget === null ? "safe" : monthSpent > budget ? "over" : used >= 80 ? "warn" : "safe";

  const barColor =
    status === "over" ? "bg-red-500" : status === "warn" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card
      id="budget-guard"
      className={`h-full border-emerald-200/60 dark:border-emerald-900/50 shadow-sm transition-shadow ${
        status === "over" ? "ring-2 ring-red-500/70 dark:ring-red-500/50" : ""
      }`}
    >
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${
              status === "over" ? "bg-red-500" : "bg-amber-500"
            }`}>
              <PiggyBank className="h-4 w-4" />
            </span>
            <h2 className="font-semibold tracking-tight">Budget Guard</h2>
            {status === "over" && (
              <span className="animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-300">
                Over budget
              </span>
            )}
          </div>
          {budget !== null && !editing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => {
                setValue(String(budget));
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          )}
        </div>

        {editing || budget === null ? (
          <form onSubmit={handleSave} className="space-y-3 flex-1 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">
              How much do you want to spend in {monthLabel}? This powers your live
              guard rail and daily safe-to-spend number.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 20000"
                aria-label="Monthly budget amount"
                className="focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
              />
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Budget"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[5000, 10000, 20000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue(String(preset))}
                  className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {formatMoney(preset, currencySymbol)}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Spent</span>
              <span className="text-sm font-medium">
                {formatMoney(monthSpent, currencySymbol)} / {formatMoney(budget, currencySymbol)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${used}%` }}
                role="progressbar"
                aria-valuenow={Math.round(used)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{Math.round(used)}% used</span>
              <span className={remaining >= 0 ? "text-muted-foreground" : "font-medium text-red-500"}>
                {remaining >= 0
                  ? `${formatMoney(remaining, currencySymbol)} left · ${daysLeft} day${daysLeft === 1 ? "" : "s"} to go`
                  : `${formatMoney(-remaining, currencySymbol)} over budget`}
              </span>
            </div>

            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                status === "over"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                  : status === "warn"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              }`}
            >
              {status === "over" ? (
                <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" />
              ) : status === "warn" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>
                {status === "over"
                  ? `You've crossed your ${monthLabel} budget. Consider pausing non-essentials or raising the budget to a realistic number.`
                  : status === "warn"
                    ? `Careful — you're past 80% of budget. Safe to spend ≈ ${formatMoney(safePerDay, currencySymbol)}/day for the next ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
                    : `On track. Safe to spend ≈ ${formatMoney(safePerDay, currencySymbol)}/day for the next ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
