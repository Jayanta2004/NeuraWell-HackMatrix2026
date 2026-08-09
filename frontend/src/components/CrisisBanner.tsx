"use client";

import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";

export function CrisisBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong flex flex-col gap-3 rounded-2xl border-l-4 p-5 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderLeftColor: "var(--danger)" }}
    >
      <div>
        <p className="font-semibold" style={{ color: "var(--danger)" }}>
          You matter, and immediate support is available.
        </p>
        <p className="mt-1 text-sm text-muted">
          It sounds like you might be in crisis. Please reach out right now — you don&apos;t have
          to go through this alone.
        </p>
      </div>
      <a
        href="tel:988"
        className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: "var(--danger)" }}
      >
        <PhoneCall size={16} />
        Call / Text 988
      </a>
    </motion.div>
  );
}
