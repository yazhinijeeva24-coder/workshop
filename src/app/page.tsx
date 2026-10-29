"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { HowToUseGuide } from "@/components/how-to-use-guide";
import { QuickAdd, type ExpenseRecord } from "@/components/quick-add";
import { StatsCards } from "@/components/stats-cards";
import { BudgetCard } from "@/components/budget-card";
import { SpendCharts } from "@/components/spend-charts";
import { Transactions } from "@/components/transactions";
import { SmartAlerts } from "@/components/smart-alerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  formatMoney,
  getCategory,
  CURRENCIES,
  monthKey,
  isSameDay,
} from "@/lib/categories";
import {
  BookOpen,
  Feather,
  Moon,
  Sun,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const GUIDE_KEY = "pennypilot_guide_seen_v1";
const CURRENCY_KEY = "pennypilot_currency";

export default function Home() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<string>("INR");
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const { resolvedTheme, setTheme } = useTheme();

  // ── boot: load data + preferences, auto-open guide for first visit ──
  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem(GUIDE_KEY);
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (savedCurrency) setCurrency(savedCurrency);

    (async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          fetch("/api/expenses"),
          fetch("/api/budget"),
        ]);
        if (expRes.ok) {
          const data = await expRes.json();
          setExpenses(data.expenses ?? []);
        }
        if (budRes.ok) {
          const data = await budRes.json();
          setBudget(data.budget && data.budget.amount > 0 ? data.budget.amount : null);
        }
      } catch {
        toast.error("Couldn't reach the server. Refresh to try again.");
      } finally {
        setLoading(false);
        if (!seen) {
          setTimeout(() => setGuideOpen(true), 400);
          localStorage.setItem(GUIDE_KEY, "1");
        }
      }
    })();
  }, []);

  const symbol = useMemo(
    () => CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹",
    [currency]
  );

  // ── month math ────────────────────────────────────────────────
  const now = new Date();
  const currentMonthK = monthKey(now);
  const viewMonthK = monthKey(viewDate);
  const isCurrentMonth = viewMonthK === currentMonthK;
  const viewMonthLabel = viewDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
  const currentMonthLabel = now.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const daysLeftCurrent = Math.max(
    1,
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1
  );

  const viewMonthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(new Date(e.date)) === viewMonthK),
    [expenses, viewMonthK]
  );

  const currentMonthTotal = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(new Date(e.date)) === currentMonthK)
        .reduce((s, e) => s + e.amount, 0),
    [expenses, currentMonthK]
  );

  const viewMonthTotal = useMemo(
    () => viewMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [viewMonthExpenses]
  );

  const spentToday = useMemo(() => {
    const today = new Date();
    return expenses
      .filter((e) => isSameDay(new Date(e.date), today))
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const dayAvg = useMemo(() => {
    const days = new Set(viewMonthExpenses.map((e) => new Date(e.date).getDate()));
    return days.size ? viewMonthTotal / days.size : 0;
  }, [viewMonthExpenses, viewMonthTotal]);

  const topCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of viewMonthExpenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    let top: string | null = null;
    let max = 0;
    for (const [id, amount] of totals) {
      if (amount > max) {
        max = amount;
        top = id;
      }
    }
    return top;
  }, [viewMonthExpenses]);

  // ── handlers ──────────────────────────────────────────────────
  const handleAdded = useCallback((expense: ExpenseRecord) => {
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleRestored = useCallback((expense: ExpenseRecord) => {
    setExpenses((prev) =>
      [expense, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, []);

  const handleUpdated = useCallback((updated: ExpenseRecord) => {
    setExpenses((prev) =>
      prev
        .map((e) => (e.id === updated.id ? updated : e))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  const handleBudgetSaved = useCallback((amount: number | null) => {
    setBudget(amount);
  }, []);

  const scrollToBudget = useCallback(() => {
    document
      .getElementById("budget-guard")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleExport = useCallback(() => {
    if (expenses.length === 0) {
      toast.info("Nothing to export yet — add some expenses first.");
      return;
    }
    const rows = [
      ["Date", "Amount", "Category", "Note"],
      ...expenses.map((e) => [
        new Date(e.date).toISOString().slice(0, 10),
        String(e.amount),
        getCategory(e.category).label,
        e.note.replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pennypilot-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${expenses.length} expenses as CSV`);
  }, [expenses]);

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const shiftMonth = (delta: number) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/70 via-background to-background dark:from-emerald-950/20">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Feather className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">PennyPilot</p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                two-second expense tracking for everyone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger
                className="h-9 w-[72px] text-sm"
                aria-label="Select currency"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
              onClick={() => setGuideOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">How to Use</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6 space-y-5 sm:space-y-6">
        {/* hero strip */}
        <section className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Track every expense in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                two seconds flat
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              No forms. No logins. Just type “lunch 250” and you&apos;re done —
              PennyPilot figures out the rest.
            </p>
          </div>
          <Image
            src="/pics/hero-wallet.png"
            alt="Person happily tracking expenses on a phone surrounded by coins and charts"
            width={576}
            height={432}
            priority
            className="h-32 w-full max-w-sm rounded-2xl object-cover shadow-md ring-1 ring-emerald-200/70 md:h-36 md:w-60 md:flex-none dark:ring-emerald-900/60"
          />
        </section>

        {loading ? (
          <div className="space-y-5">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
              <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
              <Skeleton className="h-80 rounded-2xl lg:col-span-3" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your money story…
            </p>
          </div>
        ) : (
          <>
            <QuickAdd
              currencySymbol={symbol}
              onAdded={handleAdded}
              lastExpense={expenses[0] ?? null}
            />

            {/* highlighted alerts & insights */}
            <SmartAlerts
              expenses={expenses}
              viewMonthKey={viewMonthK}
              isCurrentMonth={isCurrentMonth}
              monthTotal={isCurrentMonth ? currentMonthTotal : viewMonthTotal}
              budget={budget}
              currencySymbol={symbol}
              daysLeft={daysLeftCurrent}
              daysInMonth={daysInMonth}
              onSetBudget={scrollToBudget}
            />

            {/* month navigator */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {isCurrentMonth ? "Live dashboard" : `Viewing ${viewMonthLabel}`}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-36 text-center text-sm font-semibold">
                  {viewMonthLabel}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Next month"
                  disabled={isCurrentMonth}
                  onClick={() => shiftMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-emerald-600 dark:text-emerald-400"
                    onClick={() => setViewDate(new Date())}
                  >
                    Back to today
                  </Button>
                )}
              </div>
            </div>

            <StatsCards
              monthTotal={viewMonthTotal}
              dayAvg={dayAvg}
              topCategory={topCategory}
              txCount={viewMonthExpenses.length}
              spentToday={spentToday}
              currencySymbol={symbol}
              monthLabel={viewMonthLabel}
              isCurrentMonth={isCurrentMonth}
            />

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <BudgetCard
                  budget={budget}
                  monthSpent={currentMonthTotal}
                  currencySymbol={symbol}
                  monthLabel={currentMonthLabel}
                  daysLeft={daysLeftCurrent}
                  onSaved={handleBudgetSaved}
                />
              </div>
              <div className="lg:col-span-3">
                <SpendCharts
                  expenses={expenses}
                  currencySymbol={symbol}
                  viewMonthKey={viewMonthK}
                  monthLabel={viewMonthLabel}
                />
              </div>
            </div>

            <Transactions
              expenses={expenses}
              currencySymbol={symbol}
              monthLabel={viewMonthLabel}
              isCurrentMonth={isCurrentMonth}
              viewMonthKey={viewMonthK}
              onDeleted={handleDeleted}
              onRestored={handleRestored}
              onUpdated={handleUpdated}
              onExport={handleExport}
            />
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-auto border-t bg-background/60 py-4">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-1 px-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            <span className="font-semibold text-foreground">PennyPilot</span> —
            small habit, big clarity. Built for everyone.
          </p>
          <p>
            Your data lives in this app — export anytime as CSV.
          </p>
        </div>
      </footer>

      {/* ── Guided onboarding ──────────────────────────────────── */}
      <HowToUseGuide open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}
