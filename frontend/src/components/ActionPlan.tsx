"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Leaf } from "lucide-react";
import { useState } from "react";

interface ActionPlanProps {
  steps: string[];
}

export function ActionPlan({ steps }: ActionPlanProps) {
  const [done, setDone] = useState<Set<number>>(new Set());

  if (!steps.length) return null;

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const progressPercent = Math.round((done.size / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass animate-fade-in-up rounded-2xl p-4 border border-emerald-500/10 dark:bg-emerald-950/30"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <Leaf size={16} />
          Grounding Action Plan
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {done.size}/{steps.length} ({progressPercent}%)
        </span>
      </div>

      {/* Progress percentage bar */}
      <div className="mb-3.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/10">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <ul className="flex flex-col gap-2">
        <AnimatePresence>
          {steps.map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-emerald-500/10"
              >
                {done.has(i) ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle size={18} className="mt-0.5 shrink-0 text-emerald-600/40" />
                )}
                <span className={done.has(i) ? "text-muted line-through" : "text-foreground"}>
                  {step}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}
