"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  parseQuickInput,
  getCategory,
  CATEGORIES,
  formatMoney,
  isSameDay,
} from "@/lib/categories";
import {
  Zap,
  Plus,
  CalendarDays,
  Tag,
  Coins,
  NotebookPen,
  PencilLine,
  Sparkles,
  Loader2,
} from "lucide-react";

export type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export function QuickAdd({
  currencySymbol,
  onAdded,
  lastExpense,
}: {
  currencySymbol: string;
  onAdded: (expense: ExpenseRecord) => void;
  lastExpense?: ExpenseRecord | null;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // manual form state
  const [mAmount, setMAmount] = useState("");
  const [mCategory, setMCategory] = useState<string>("Food");
  const [mNote, setMNote] = useState("");
  const [mDate, setMDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Press "/" anywhere to jump straight into the Smart Box
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = useMemo(() => parseQuickInput(text), [text]);

  const dayLabel = useMemo(() => {
    const target = new Date();
    if (parsed.dateHint === "yesterday") target.setDate(target.getDate() - 1);
    const now = new Date();
    if (isSameDay(target, now)) return "Today";
    return "Yesterday";
  }, [parsed.dateHint]);

  async function addExpense(payload: {
    amount: number;
    category: string;
    note: string;
    date: Date;
  }) {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Could not save expense");
    }
    const data = await res.json();
    onAdded(data.expense as ExpenseRecord);
  }

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed.valid || submitting) {
      if (!parsed.valid) {
        toast.error("Add an amount — e.g. lunch 250");
      }
      return;
    }
    setSubmitting(true);
    const date = new Date();
    if (parsed.dateHint === "yesterday") date.setDate(date.getDate() - 1);
    try {
      await addExpense({
        amount: parsed.amount!,
        category: parsed.category,
        note: parsed.note,
        date,
      });
      const cat = getCategory(parsed.category);
      toast.success(`Added ${formatMoney(parsed.amount!, currencySymbol)} · ${cat.emoji} ${cat.label}`, {
        description: parsed.note ? `“${parsed.note}”` : undefined,
      });
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(mAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      const date = new Date(`${mDate}T12:00:00`);
      await addExpense({ amount, category: mCategory, note: mNote, date });
      const cat = getCategory(mCategory);
      toast.success(`Added ${formatMoney(amount, currencySymbol)} · ${cat.emoji} ${cat.label}`);
      setMAmount("");
      setMNote("");
      setMDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-emerald-200/60 dark:border-emerald-900/50 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        {!manualMode ? (
          <form onSubmit={handleQuickSubmit}>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Zap className="h-4 w-4" />
              </span>
              <h2 className="font-semibold tracking-tight">Smart Add</h2>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                just type &amp; press Enter
              </Badge>
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-block" title="Press / anywhere to focus">
                /
              </kbd>
            </div>

            <div className="relative">
              <Input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Try: lunch 250  ·  uber 90 yesterday  ·  coffee $4.5'
                aria-label="Type your expense naturally"
                className="h-13 min-h-[52px] rounded-xl border-2 pr-28 text-base sm:text-lg focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                autoFocus
              />
              <Button
                type="submit"
                disabled={submitting || !parsed.valid}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 rounded-lg bg-emerald-600 px-4 hover:bg-emerald-700 text-white disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </>
                )}
              </Button>
            </div>

            {/* live parse preview */}
            <div className="mt-3 min-h-[36px]">
              {text.trim() && parsed.valid ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Detected:</span>
                  <Badge variant="outline" className="gap-1 border-emerald-300 dark:border-emerald-700">
                    <Coins className="h-3 w-3" />
                    {formatMoney(parsed.amount!, currencySymbol)}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-emerald-300 dark:border-emerald-700">
                    <Tag className="h-3 w-3" />
                    {getCategory(parsed.category).emoji} {getCategory(parsed.category).label}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-emerald-300 dark:border-emerald-700">
                    <CalendarDays className="h-3 w-3" />
                    {dayLabel}
                  </Badge>
                  {parsed.note && (
                    <Badge variant="outline" className="gap-1 max-w-44 border-emerald-300 dark:border-emerald-700">
                      <NotebookPen className="h-3 w-3 shrink-0" />
                      <span className="truncate">{parsed.note}</span>
                    </Badge>
                  )}
                </div>
              ) : text.trim() ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Hmm, no amount found. Try ending with a number — e.g. “movie 300”.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Quick picks:</span>
                  {["lunch 250", "auto 40", "groceries 899", "movie 300 yesterday"].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setText(ex);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {ex}
                    </button>
                  ))}
                  {lastExpense && (
                    <button
                      type="button"
                      onClick={() => {
                        const cat = getCategory(lastExpense.category);
                        setText(`${lastExpense.note || cat.label.toLowerCase()} ${lastExpense.amount}`);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-emerald-400 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                      title="One tap to log the same expense again"
                    >
                      ↻ Repeat last: {lastExpense.note || getCategory(lastExpense.category).label} {lastExpense.amount}
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <PencilLine className="h-4 w-4" />
              </span>
              <h2 className="font-semibold tracking-tight">Detailed Add</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-amount">Amount</Label>
                <Input
                  id="m-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value)}
                  placeholder="0.00"
                  className="focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-category">Category</Label>
                <Select value={mCategory} onValueChange={setMCategory}>
                  <SelectTrigger id="m-category" className="w-full focus-visible:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-date">Date</Label>
                <Input
                  id="m-date"
                  type="date"
                  value={mDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setMDate(e.target.value)}
                  className="focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-note">Note (optional)</Label>
              <Input
                id="m-note"
                value={mNote}
                onChange={(e) => setMNote(e.target.value)}
                placeholder="What was it for?"
                className="focus-visible:ring-emerald-500"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Save Expense
                </>
              )}
            </Button>
          </form>
        )}

        <div className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          {manualMode ? (
            <>
              Prefer speed?{" "}
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Switch back to Smart Add
              </button>
            </>
          ) : (
            <>
              Need a custom category or a past date?{" "}
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Use Detailed Add
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
