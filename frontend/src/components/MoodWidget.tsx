"use client";

import { motion } from "framer-motion";
import { severityBg, severityColor, severityLabel } from "@/lib/mood";

interface MoodWidgetProps {
  mood: string | null;
  severity: number | null;
}

export function MoodWidget({ mood, severity }: MoodWidgetProps) {
  if (!mood || severity === null) {
    return (
      <div className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted border border-emerald-500/10">
        <span className="h-2 w-2 rounded-full bg-emerald-500/40" />
        No mood detected
      </div>
    );
  }

  const color = severityColor(severity);
  const bg = severityBg(severity);

  return (
    <motion.div
      key={`${mood}-${severity}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border shadow-xs"
      style={{ background: bg, color, borderColor: `${color}40` }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full"
          style={{ background: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="capitalize font-bold">{mood}</span>
      <span className="opacity-80">({severity}/10 · {severityLabel(severity)})</span>
    </motion.div>
  );
}
