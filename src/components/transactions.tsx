"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatMoney, getCategory, isSameDay } from "@/lib/categories";
import type { ExpenseRecord } from "./quick-add";
import { EditExpenseDialog } from "./edit-expense-dialog";
import {
  Search,
  Trash2,
  Receipt,
  Download,
  Pencil,
} from "lucide-react";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

export function Transactions({
  expenses,
  currencySymbol,
  monthLabel,
  isCurrentMonth,
  viewMonthKey,
  onDeleted,
  onRestored,
  onUpdated,
  onExport,
}: {
  expenses: ExpenseRecord[];
  currencySymbol: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  viewMonthKey: string;
  onDeleted: (id: string) => void;
  onRestored: (expense: ExpenseRecord) => void;
  onUpdated: (expense: ExpenseRecord) => void;
  onExport: () => void;
}) {
  const [scope, setScope] = useState<"month" | "all">("month");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (scope === "month") {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== viewMonthKey) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const cat = getCategory(e.category);
        return (
          e.note.toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q) ||
          String(e.amount).includes(q)
        );
      }
      return true;
    });
  }, [expenses, scope, query, viewMonthKey]);

  async function handleDelete(expense: ExpenseRecord) {
    setDeletingId(expense.id);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete expense");
      onDeleted(expense.id);
      toast.success(`Deleted ${formatMoney(expense.amount, currencySymbol)}`, {
        description: expense.note || undefined,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const restore = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amount: expense.amount,
                  category: expense.category,
                  note: expense.note,
                  date: expense.date,
                }),
              });
              if (!restore.ok) throw new Error();
              const data = await restore.json();
              onRestored(data.expense as ExpenseRecord);
              toast.success("Restored ✓");
            } catch {
              toast.error("Could not undo — add it again manually");
            }
          },
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  const shownTotal = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <Card className="border-emerald-200/60 dark:border-emerald-900/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Your expenses
            </CardTitle>
            <CardDescription className="mt-1">
              {filtered.length} entr{filtered.length === 1 ? "y" : "ies"} · {formatMoney(shownTotal, currencySymbol)} total
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={scope} onValueChange={(v) => setScope(v as "month" | "all")}>
              <TabsList>
                <TabsTrigger value="month" className="text-xs sm:text-sm">
                  {isCurrentMonth ? "This month" : monthLabel}
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm">All time</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, categories or amounts…"
            aria-label="Search expenses"
            className="pl-9 focus-visible:ring-emerald-500"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-muted-foreground">
            <Image
              src="/pics/pic-empty.png"
              alt="Open wallet with a small plant sprouting from it"
              width={112}
              height={112}
              className="h-24 w-24 rounded-2xl object-cover shadow-sm ring-1 ring-emerald-200/60 sm:h-28 sm:w-28 dark:ring-emerald-900/60"
            />
            {expenses.length === 0
              ? "No expenses yet — add your first one with the Smart Add box above."
              : "Nothing matches this filter. Try 'All time' or clear the search."}
          </div>
        ) : (
          <ScrollArea className="max-h-96 overflow-y-auto rounded-lg">
            <ul className="divide-y">
              {filtered.map((e) => {
                const cat = getCategory(e.category);
                return (
                  <li
                    key={e.id}
                    className="group flex items-center gap-3 py-2.5 pr-1 transition-colors hover:bg-muted/50 sm:px-2"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${cat.color}1f` }}
                      aria-hidden
                    >
                      {cat.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.note || cat.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cat.label} · {dayLabel(e.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatMoney(e.amount, currencySymbol)}
                    </span>
                    <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit expense ${e.note || cat.label}`}
                        onClick={() => setEditing(e)}
                        className="h-8 w-8 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete expense ${e.note || cat.label}`}
                        onClick={() => handleDelete(e)}
                        disabled={deletingId === e.id}
                        className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      <EditExpenseDialog
        expense={editing}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={onUpdated}
      />
    </Card>
  );
}
