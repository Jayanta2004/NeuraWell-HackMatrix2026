"use client";

import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { useEffect, useState } from "react";

const PHASES = [
  { label: "Breathe in", duration: 4, scale: 1.4 },
  { label: "Hold", duration: 4, scale: 1.4 },
  { label: "Breathe out", duration: 4, scale: 1 },
  { label: "Hold", duration: 4, scale: 1 },
] as const;

export function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const phase = PHASES[phaseIndex];
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration * 1000);
    return () => clearTimeout(timer);
  }, [active, phaseIndex]);

  const phase = PHASES[phaseIndex];

  return (
    <div className="glass flex flex-col items-center gap-6 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Wind size={16} />
        Box breathing
      </div>

      <div className="relative flex h-48 w-48 items-center justify-center">
        <motion.div
          className="absolute h-32 w-32 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            opacity: 0.35,
          }}
          animate={{ scale: active ? phase.scale : 1 }}
          transition={{ duration: phase.duration, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-24 w-24 rounded-full border-2"
          style={{ borderColor: "var(--primary)" }}
          animate={{ scale: active ? phase.scale : 1 }}
          transition={{ duration: phase.duration, ease: "easeInOut" }}
        />
        <span className="relative text-sm font-medium text-foreground">
          {active ? phase.label : "Ready?"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          setPhaseIndex(0);
          setActive((v) => !v);
        }}
        className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--primary)" }}
      >
        {active ? "Stop" : "Start breathing"}
      </button>
    </div>
  );
}
