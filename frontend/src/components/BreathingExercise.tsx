"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Wind } from "lucide-react";
import { useEffect, useState } from "react";

export type BreathingPatternKey = "box" | "4-7-8" | "resonant";

interface Phase {
  label: string;
  duration: number;
  scale: number;
}

interface PatternConfig {
  id: BreathingPatternKey;
  name: string;
  description: string;
  phases: Phase[];
}

const PATTERNS: PatternConfig[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4s In · 4s Hold · 4s Out · 4s Hold",
    phases: [
      { label: "Breathe In", duration: 4, scale: 1.45 },
      { label: "Hold Breath", duration: 4, scale: 1.45 },
      { label: "Breathe Out", duration: 4, scale: 1 },
      { label: "Hold Breath", duration: 4, scale: 1 },
    ],
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "4s In · 7s Hold · 8s Out",
    phases: [
      { label: "Breathe In", duration: 4, scale: 1.5 },
      { label: "Hold Breath", duration: 7, scale: 1.5 },
      { label: "Breathe Out", duration: 8, scale: 1 },
    ],
  },
  {
    id: "resonant",
    name: "Resonant Breathing",
    description: "5.5s In · 5.5s Out",
    phases: [
      { label: "Breathe In", duration: 5.5, scale: 1.4 },
      { label: "Breathe Out", duration: 5.5, scale: 1 },
    ],
  },
];

export function BreathingExercise() {
  const [selectedPatternKey, setSelectedPatternKey] = useState<BreathingPatternKey>("box");
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentPattern = PATTERNS.find((p) => p.id === selectedPatternKey) || PATTERNS[0];
  const currentPhase = currentPattern.phases[phaseIndex];

  // Reset timers on pattern change
  const handleSelectPattern = (key: BreathingPatternKey) => {
    setSelectedPatternKey(key);
    setActive(false);
    setPhaseIndex(0);
    const newPattern = PATTERNS.find((p) => p.id === key) || PATTERNS[0];
    setTimeLeft(newPattern.phases[0].duration);
  };

  useEffect(() => {
    if (!active) return;

    const countdown = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, Math.round((prev - 0.1) * 10) / 10));
    }, 100);

    const timer = setTimeout(() => {
      setPhaseIndex((i) => {
        const nextIndex = (i + 1) % currentPattern.phases.length;
        setTimeLeft(currentPattern.phases[nextIndex].duration);
        return nextIndex;
      });
    }, currentPhase.duration * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timer);
    };
  }, [active, phaseIndex, currentPattern, currentPhase.duration]);

  return (
    <div className="glass flex w-full max-w-md flex-col items-center gap-6 rounded-3xl p-6 sm:p-8 border border-emerald-500/10 dark:bg-emerald-950/30">
      <div className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-400">
        <Wind size={20} className="animate-pulse" />
        Breathing Sanctuary
      </div>

      {/* Pattern Selector */}
      <div className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-emerald-500/10 p-1.5 text-xs">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPattern(p.id)}
            className={`rounded-xl py-2 px-1.5 font-medium transition-all ${
              selectedPatternKey === p.id
                ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-emerald-950 font-bold"
                : "text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/10"
            }`}
          >
            {p.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted font-medium">
        {currentPattern.description}
      </p>

      {/* Breathing Circle Container */}
      <div className="relative flex h-60 w-60 items-center justify-center my-2">
        {/* Outer Aura Circle */}
        <motion.div
          className="absolute h-44 w-44 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 blur-xl"
          animate={{ scale: active ? currentPhase.scale * 1.15 : 1 }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
        />

        {/* Pulsing Outer Ring */}
        <motion.div
          className="absolute h-40 w-40 rounded-full border-2 border-emerald-500/30 dark:border-emerald-400/40"
          animate={{ scale: active ? currentPhase.scale : 1 }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
        />

        {/* Solid Inner Circle */}
        <motion.div
          className="absolute h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 dark:from-emerald-500 dark:to-teal-300 opacity-90 shadow-lg"
          animate={{ scale: active ? currentPhase.scale : 1 }}
          transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
        />

        {/* Central Text & Phase Status */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white dark:text-emerald-950 font-semibold drop-shadow-sm">
          <span className="text-base font-bold tracking-wide">
            {active ? currentPhase.label : "Tap Start"}
          </span>
          {active && (
            <span className="mt-1 text-2xl font-black font-mono">
              {Math.ceil(timeLeft)}s
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!active) {
              setPhaseIndex(0);
              setTimeLeft(currentPattern.phases[0].duration);
            }
            setActive((v) => !v);
          }}
          className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white dark:text-emerald-950 shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-400"
        >
          {active ? <Pause size={16} /> : <Play size={16} />}
          {active ? "Pause" : "Start Session"}
        </button>

        {active && (
          <button
            type="button"
            onClick={() => {
              setActive(false);
              setPhaseIndex(0);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full glass text-muted hover:text-foreground transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
