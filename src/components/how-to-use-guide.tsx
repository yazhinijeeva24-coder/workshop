"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  PiggyBank,
  LineChart,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

type Step = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  image: string;
  imageAlt: string;
};

const STEPS: Step[] = [
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: "Welcome to PennyPilot",
    subtitle: "Expense tracking that actually sticks",
    body: "Most expense trackers fail because they take too much effort — forms, dropdowns, logins. PennyPilot fixes that: no signup, no clutter. Just type what you spent in one line and you're done.",
    bullets: [
      "Free & instant — start tracking in seconds",
      "Works on phone, tablet and desktop",
      "Your data stays yours — export anytime",
    ],
    image: "/pics/pic-welcome.png",
    imageAlt: "Friendly flying wallet character surrounded by golden coins",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "Step 1 · Add in one line",
    subtitle: "The Smart Box — our signature feature",
    body: "Type an expense the way you'd say it. PennyPilot reads your words, pulls out the amount, guesses the category and logs it. No forms, no dropdowns — just press Enter.",
    bullets: [
      "\"lunch 250\" → ₹250 · Food & Dining",
      "\"uber ride 90 yesterday\" → dated to yesterday",
      "\"coffee $4.5\" → currencies are welcome",
      "Press / anywhere to jump straight to this box",
    ],
    image: "/pics/pic-smart-add.png",
    imageAlt: "Hand typing an expense on a phone while coins and a receipt fly out",
  },
  {
    icon: <PiggyBank className="h-7 w-7" />,
    title: "Step 2 · Set a monthly budget",
    subtitle: "Your spending guard rail",
    body: "Give the Budget Guard a monthly number. It keeps score as you spend: green while you're safe, amber when you cross 80%, and a clear red alert when you go over — so surprises never happen.",
    bullets: [
      "Live progress bar with safe-to-spend per day",
      "Colour-coded warnings before you overspend",
      "Change your budget anytime",
    ],
    image: "/pics/pic-budget.png",
    imageAlt: "Piggy bank with a safety shield beside a spending progress bar",
  },
  {
    icon: <LineChart className="h-7 w-7" />,
    title: "Step 3 · Watch your insights",
    subtitle: "Patterns you can actually use",
    body: "Every expense feeds your dashboard: live alerts when you near your budget, a month-end projection, a category donut showing where money really goes, and a 14-day trend — with the important stuff highlighted so you never miss it.",
    bullets: [
      "Colour-coded budget & overspend alerts",
      "Month-end projection based on your pace",
      "Where-did-it-go donut & 14-day rhythm",
    ],
    image: "/pics/pic-insights.png",
    imageAlt: "Donut chart and rising bar chart with a magnifying glass",
  },
  {
    icon: <Rocket className="h-7 w-7" />,
    title: "You're ready to fly",
    subtitle: "Two-second habit, lifetime of clarity",
    body: "Add today's first expense below — it takes 2 seconds. Come back whenever you spend; the more honest and regular you are, the smarter your insights get. You can reopen this guide anytime from the header.",
    bullets: [
      "Start with: coffee 40",
      "Edit, undo or delete any entry anytime",
      "Browse past months with ‹ › arrows · export CSV",
    ],
    image: "/pics/pic-ready.png",
    imageAlt: "Rocket launching upward with coins and confetti",
  },
];

export function HowToUseGuide({
  open,
  onOpenChange,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish?: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish?.();
      onOpenChange(false);
      // reset so reopening from header starts fresh
      setTimeout(() => setStep(0), 300);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl p-0 [&>button]:z-10">
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 pt-8 pb-10 text-white dark:from-emerald-700 dark:via-teal-800 dark:to-emerald-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                {current.icon}
              </div>
              <DialogTitle className="mt-3 text-xl font-bold tracking-tight text-white">
                {current.title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-emerald-100">
                {current.subtitle}
              </DialogDescription>
            </motion.div>
          </AnimatePresence>
          {/* progress dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-50 to-teal-50/60 ring-1 ring-emerald-200/70 dark:from-emerald-950/40 dark:to-teal-950/30 dark:ring-emerald-900/60">
                <Image
                  src={current.image}
                  alt={current.imageAlt}
                  width={1024}
                  height={1024}
                  className="h-32 w-full object-cover object-center sm:h-40"
                />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {current.body}
              </p>
              <ul className="mt-3 space-y-2">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              {step + 1} / {STEPS.length}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={handleBack} size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              {!isLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFinish?.();
                    onOpenChange(false);
                    setTimeout(() => setStep(0), 300);
                  }}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isLast ? "Start Tracking" : "Next"}
                {!isLast && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
