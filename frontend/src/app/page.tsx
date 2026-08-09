"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookHeart,
  Leaf,
  Menu,
  MessageCircle,
  Wind,
  X,
} from "lucide-react";
import { useState } from "react";
import { BreathingExercise } from "@/components/BreathingExercise";
import { ChatInterface } from "@/components/ChatInterface";
import { JournalMode } from "@/components/JournalMode";
import { MoodTrendDashboard } from "@/components/MoodTrendDashboard";
import { MoodWidget } from "@/components/MoodWidget";
import { ThemeToggle } from "@/components/ThemeToggle";

type View = "chat" | "journal" | "trends" | "breathe";

const NAV_ITEMS: { id: View; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "journal", label: "Journal", icon: BookHeart },
  { id: "trends", label: "Mood trends", icon: BarChart3 },
  { id: "breathe", label: "Breathe", icon: Wind },
];

export default function Home() {
  const [view, setView] = useState<View>("chat");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [severity, setSeverity] = useState<number | null>(null);

  const handleMoodUpdate = (m: string, s: number) => {
    setMood(m);
    setSeverity(s);
  };

  const navigate = (v: View) => {
    setView(v);
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="glass hidden w-64 shrink-0 flex-col gap-1 p-4 md:flex">
        <Logo />
        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={view === item.id} onClick={() => navigate(item.id)} />
          ))}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="glass-strong fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 p-4 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavButton key={item.id} item={item} active={view === item.id} onClick={() => navigate(item.id)} />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-semibold capitalize sm:text-base">
              {NAV_ITEMS.find((n) => n.id === view)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MoodWidget mood={mood} severity={severity} />
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto h-full max-w-3xl">
            {view === "chat" && <ChatInterface onMoodUpdate={handleMoodUpdate} />}
            {view === "journal" && <JournalMode onMoodUpdate={handleMoodUpdate} />}
            {view === "trends" && <MoodTrendDashboard />}
            {view === "breathe" && (
              <div className="flex h-full items-center justify-center">
                <BreathingExercise />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: "var(--primary)" }}
      >
        <Leaf size={16} className="text-primary-foreground" />
      </div>
      <span className="text-base font-semibold tracking-tight">NeuraWell</span>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { id: View; label: string; icon: typeof MessageCircle };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "text-primary-foreground" : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
      }`}
      style={active ? { background: "var(--primary)" } : undefined}
    >
      <Icon size={17} />
      {item.label}
    </button>
  );
}
