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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass animate-fade-in-up rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <Leaf size={16} />
        Grounding plan
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
                className="flex w-full items-start gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {done.has(i) ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                ) : (
                  <Circle size={18} className="mt-0.5 shrink-0 text-muted" />
                )}
                <span className={done.has(i) ? "text-muted line-through" : ""}>{step}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}
