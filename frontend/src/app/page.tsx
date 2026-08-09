"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookHeart,
  BrainCircuit,
  FileText,
  Headphones,
  Leaf,
  Menu,
  MessageCircle,
  ShieldAlert,
  Wind,
  X,
} from "lucide-react";
import { useState } from "react";
import { BreathingExercise } from "@/components/BreathingExercise";
import { CBTReframer } from "@/components/CBTReframer";
import { ChatInterface } from "@/components/ChatInterface";
import { CrisisToolkitModal } from "@/components/CrisisToolkitModal";
import { JournalMode } from "@/components/JournalMode";
import { MoodTrendDashboard } from "@/components/MoodTrendDashboard";
import { MoodWidget } from "@/components/MoodWidget";
import { Soundscapes } from "@/components/Soundscapes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WellnessQuests } from "@/components/WellnessQuests";
import { WellnessReportModal } from "@/components/WellnessReportModal";

type View = "chat" | "journal" | "cbt" | "soundscapes" | "quests" | "trends" | "breathe";

const NAV_ITEMS: { id: View; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat Sanctuary", icon: MessageCircle },
  { id: "journal", label: "Journal & Reflections", icon: BookHeart },
  { id: "cbt", label: "CBT Reframer", icon: BrainCircuit },
  { id: "soundscapes", label: "Soundscapes", icon: Headphones },
  { id: "quests", label: "Daily Quests", icon: Award },
  { id: "trends", label: "Mood Trends", icon: BarChart3 },
  { id: "breathe", label: "Breathing Sanctuary", icon: Wind },
];

export default function Home() {
  const [view, setView] = useState<View>("chat");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [severity, setSeverity] = useState<number | null>(null);

  // Modals state
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

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
      <aside className="glass hidden w-64 shrink-0 flex-col gap-1 p-4 md:flex border-r border-emerald-500/10">
        <Logo />
        <nav className="mt-6 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => navigate(item.id)}
            />
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
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
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={view === item.id}
                    onClick={() => navigate(item.id)}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navigation Header */}
        <header className="glass flex items-center justify-between gap-3 px-4 py-3 sm:px-6 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-bold capitalize sm:text-base text-foreground">
              {NAV_ITEMS.find((n) => n.id === view)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Header Action: SOS Safety Toolkit Button */}
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              title="SOS Emergency Safety Toolkit"
              className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/25 transition-all"
            >
              <ShieldAlert size={15} />
              <span className="hidden sm:inline">SOS Safety</span>
            </button>

            {/* Header Action: Wellness Report Button */}
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              title="Generate Therapist Wellness Report"
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all"
            >
              <FileText size={15} />
              <span className="hidden sm:inline">Report</span>
            </button>

            <MoodWidget mood={mood} severity={severity} />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto h-full max-w-3xl">
            {view === "chat" && (
              <ChatInterface
                onMoodUpdate={handleMoodUpdate}
                onModeToggle={(m) => setView(m)}
                currentMode="chat"
              />
            )}
            {view === "journal" && (
              <JournalMode onMoodUpdate={handleMoodUpdate} />
            )}
            {view === "cbt" && <CBTReframer />}
            {view === "soundscapes" && <Soundscapes />}
            {view === "quests" && <WellnessQuests />}
            {view === "trends" && <MoodTrendDashboard />}
            {view === "breathe" && (
              <div className="flex h-full items-center justify-center">
                <BreathingExercise />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SOS Safety Toolkit Modal */}
      <CrisisToolkitModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        onNavigateBreathe={() => navigate("breathe")}
      />

      {/* Therapist Wellness Report Modal */}
      <WellnessReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 dark:bg-emerald-400 text-white dark:text-emerald-950 shadow-md">
        <Leaf size={18} />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-extrabold tracking-tight text-foreground">NeuraWell</span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 -mt-1">
          AI Mental Sanctuary
        </span>
      </div>
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
      className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950 shadow-md"
          : "text-foreground hover:bg-emerald-500/10"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </button>
  );
}
