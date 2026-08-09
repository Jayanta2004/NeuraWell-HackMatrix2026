"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  Hand,
  Ear,
  Wind,
  PhoneCall,
  ShieldAlert,
  X,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface CrisisToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateBreathe?: () => void;
}

const GROUNDING_STEPS = [
  {
    step: 5,
    title: "5 Things You Can SEE",
    icon: Eye,
    prompt: "Look around your room. Name 5 specific objects (e.g. a lamp, a shadow, a pattern on the wall).",
  },
  {
    step: 4,
    title: "4 Things You Can TOUCH",
    icon: Hand,
    prompt: "Feel the texture of 4 items near you (e.g. your desk surface, clothes fabric, your chair).",
  },
  {
    step: 3,
    title: "3 Things You Can HEAR",
    icon: Ear,
    prompt: "Listen closely. Identify 3 distant sounds (e.g. air conditioning, background hum, wind outside).",
  },
  {
    step: 2,
    title: "2 Things You Can SMELL",
    icon: Wind,
    prompt: "Notice 2 scents in the air or take a deep breath in through your nose.",
  },
  {
    step: 1,
    title: "1 Thing You Can TASTE",
    icon: CheckCircle2,
    prompt: "Notice the current taste in your mouth or sip a swallow of cool water.",
  },
];

export function CrisisToolkitModal({
  isOpen,
  onClose,
  onNavigateBreathe,
}: CrisisToolkitModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = GROUNDING_STEPS[activeStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 flex w-full max-w-xl flex-col gap-5 rounded-3xl p-6 sm:p-8 bg-slate-900 border border-red-500/30 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Safety & SOS Toolkit</h3>
                <p className="text-xs text-red-300">You are safe. We are here to support you.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Emergency Lifelines Bar */}
          <div className="flex flex-col gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall size={14} /> Immediate 24/7 Crisis Helplines:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="tel:988"
                className="flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2 font-bold text-white hover:bg-red-500/30 transition-colors"
              >
                <span>🇺🇸 / 🇨🇦 US Suicide & Crisis:</span>
                <span className="underline">Call/Text 988</span>
              </a>
              <a
                href="tel:9152987821"
                className="flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2 font-bold text-white hover:bg-red-500/30 transition-colors"
              >
                <span>🇮🇳 Tele-MANAS India:</span>
                <span className="underline">9152987821</span>
              </a>
              <a
                href="tel:111"
                className="flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2 font-bold text-white hover:bg-red-500/30 transition-colors"
              >
                <span>🇬🇧 UK NHS Crisis:</span>
                <span className="underline">Call 111</span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-between rounded-xl bg-red-500/20 px-3 py-2 font-bold text-white hover:bg-red-500/30 transition-colors"
              >
                <span>🇪🇺 / Global Lifelines:</span>
                <span className="underline">Call 112 / 911</span>
              </a>
            </div>
          </div>

          {/* Interactive 5-4-3-2-1 Sensory Grounding Guide */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} /> 5-4-3-2-1 Sensory Grounding Technique
              </span>
              <span className="text-xs font-bold text-white/70">
                Step {activeStepIndex + 1} of 5
              </span>
            </div>

            {/* Current Step Card */}
            <div className="flex flex-col gap-2 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <StepIcon size={18} />
                {currentStep.title}
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-normal">
                {currentStep.prompt}
              </p>
            </div>

            {/* Navigation buttons for grounding steps */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setActiveStepIndex((i) => Math.max(0, i - 1))}
                disabled={activeStepIndex === 0}
                className="rounded-xl px-4 py-1.5 text-xs font-semibold bg-white/10 text-white disabled:opacity-30"
              >
                Previous Step
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveStepIndex((i) =>
                    i < GROUNDING_STEPS.length - 1 ? i + 1 : 0
                  )
                }
                className="rounded-xl px-4 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                {activeStepIndex < GROUNDING_STEPS.length - 1 ? "Next Step →" : "Restart Guide"}
              </button>
            </div>
          </div>

          {/* Quick Action: Start Breathing Exercise */}
          {onNavigateBreathe && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateBreathe();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Wind size={18} />
              <span>Launch Guided Breathing Sanctuary</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
