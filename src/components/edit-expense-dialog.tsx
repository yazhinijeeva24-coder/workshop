"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { CATEGORIES, getCategory } from "@/lib/categories";
import type { ExpenseRecord } from "./quick-add";
import { Loader2, PencilLine } from "lucide-react";

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSaved,
}: {
  expense: ExpenseRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (expense: ExpenseRecord) => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setNote(expense.note);
      setDate(new Date(expense.date).toISOString().slice(0, 10));
    }
  }, [expense]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!expense) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          category,
          note,
          date: new Date(`${date}T12:00:00`).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not update expense");
      }
      const data = await res.json();
      onSaved(data.expense as ExpenseRecord);
      const cat = getCategory(category);
      toast.success(`Updated — ${cat.emoji} ${cat.label} · ${amt}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <PencilLine className="h-4 w-4" />
          </span>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Edit expense
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs">
          Fix an amount, move it to another day or re-categorise it.
        </DialogDescription>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-amount">Amount</Label>
              <Input
                id="e-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-date">Date</Label>
              <Input
                id="e-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="e-category" className="w-full focus-visible:ring-emerald-500">
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
            <Label htmlFor="e-note">Note</Label>
            <Input
              id="e-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was it for?"
              className="focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
