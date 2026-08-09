"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Circle,
  Droplet,
  Leaf,
  Sparkles,
  Sun,
  Wind,
  BookHeart,
} from "lucide-react";
import React, { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface Quest {
  id: string;
  title: string;
  category: string;
  points: number;
  icon: React.ElementType;
  description: string;
}

const QUESTS: Quest[] = [
  {
    id: "hydrate",
    title: "Mindful Sip & Hydrate",
    category: "Physical",
    points: 15,
    icon: Droplet,
    description: "Drink a glass of water slowly, focusing on how it refreshes your body.",
  },
  {
    id: "breathe",
    title: "2-Minute Breathing Pause",
    category: "Mindfulness",
    points: 20,
    icon: Wind,
    description: "Complete 1 full cycle of Box Breathing or 4-7-8 breathing.",
  },
  {
    id: "journal",
    title: "Express 1 Reflection",
    category: "Reflection",
    points: 25,
    icon: BookHeart,
    description: "Write down what's on your mind in Journal Mode.",
  },
  {
    id: "walk",
    title: "Screen Break & Stretch",
    category: "Body",
    points: 20,
    icon: Leaf,
    description: "Stand up, stretch your shoulders, and look 20 feet away for 20 seconds.",
  },
  {
    id: "affirmation",
    title: "Positive Self-Affirmation",
    category: "Self-Care",
    points: 20,
    icon: Sun,
    description: "Say out loud: 'I am doing my best, and that is enough today.'",
  },
];

const STORAGE_KEY = "neurawell:daily-quests";

export function WellnessQuests() {
  const mounted = useIsMounted();
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.date === new Date().toISOString().slice(0, 10)) {
            return parsed.completed || [];
          }
        }
      } catch {
        // ignore storage parse error
      }
    }
    return [];
  });

  const toggleQuest = (id: string) => {
    const next = completedIds.includes(id)
      ? completedIds.filter((qId) => qId !== id)
      : [...completedIds, id];

    setCompletedIds(next);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          completed: next,
        })
      );
    }
  };

  const totalPoints = QUESTS.reduce((sum, q) => sum + (completedIds.includes(q.id) ? q.points : 0), 0);
  const maxPoints = QUESTS.reduce((sum, q) => sum + q.points, 0);
  const progressPercent = Math.round((completedIds.length / QUESTS.length) * 100);

  // User rank title
  const getRankTitle = (percent: number) => {
    if (percent === 100) return "Zen Master 🧘✨";
    if (percent >= 60) return "Mindfulness Guardian 🌿";
    if (percent >= 20) return "Mindfulness Explorer 🌱";
    return "Beginner Seeker 💫";
  };

  if (!mounted) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Level Header Card */}
      <div className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <Award size={26} className="animate-bounce" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-foreground">{getRankTitle(progressPercent)}</h2>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                {totalPoints} / {maxPoints} XP
              </span>
            </div>
            <p className="text-xs text-muted">Daily Mindful Quests & Self-Care Challenges</p>
          </div>
        </div>

        {/* Progress percent badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {completedIds.length}/{QUESTS.length} Quests ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-500/10">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Completion celebration banner */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass flex items-center justify-between rounded-3xl p-5 border border-amber-500/30 bg-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={22} className="text-amber-500 animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                Daily Quest Champion! 🎉
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                You completed all 5 wellness challenges today. Great job prioritizing your mind!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quests List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {QUESTS.map((q) => {
            const isDone = completedIds.includes(q.id);
            const Icon = q.icon;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass flex items-center justify-between rounded-3xl p-5 border transition-all ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-emerald-500/10 hover:bg-emerald-500/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleQuest(q.id)}
                    className="mt-0.5 transition-transform hover:scale-110"
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    ) : (
                      <Circle size={24} className="text-emerald-600/40" />
                    )}
                  </button>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDone ? "line-through text-muted" : "text-foreground"}`}>
                        {q.title}
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        +{q.points} XP
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{q.description}</p>
                  </div>
                </div>

                <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon size={18} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
