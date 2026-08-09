"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  Copy,
  BookHeart,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { addMoodRecord } from "@/lib/moodHistory";

const emptySubscribe = () => () => {};

function useSpeechSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      const win = window as unknown as {
        SpeechRecognition?: unknown;
        webkitSpeechRecognition?: unknown;
      };
      return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
    },
    () => false
  );
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface Distortion {
  id: string;
  name: string;
  icon: string;
  description: string;
  example: string;
}

const DISTORTIONS: Distortion[] = [
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    icon: "🌀",
    description: "Expecting the worst-case scenario will happen.",
    example: "'If I mess up this presentation, my entire career is ruined.'",
  },
  {
    id: "all_or_nothing",
    name: "All-or-Nothing",
    icon: "⬛⬜",
    description: "Viewing situations in black-and-white extremes.",
    example: "'If it isn't perfect, I have completely failed.'",
  },
  {
    id: "mind_reading",
    name: "Mind Reading",
    icon: "🔮",
    description: "Assuming you know others are judging you negatively.",
    example: "'Everyone in the room thinks I don't know what I'm talking about.'",
  },
  {
    id: "emotional_reasoning",
    name: "Emotional Reasoning",
    icon: "⚡",
    description: "Assuming that because you feel anxious, the situation is dangerous.",
    example: "'I feel overwhelmed, so everything must be falling apart.'",
  },
  {
    id: "overgeneralization",
    name: "Overgeneralization",
    icon: "🏷️",
    description: "Using words like 'always', 'never', or 'everyone' based on one event.",
    example: "'Things never go right for me when it matters.'",
  },
  {
    id: "personalization",
    name: "Personalization",
    icon: "🎯",
    description: "Blaming yourself for events outside your control.",
    example: "'It's entirely my fault that the meeting went poorly.'",
  },
];

const PRESET_THOUGHTS = [
  "I have so much work to do and I'm definitely going to fail.",
  "Everyone else seems to have their life together except me.",
  "I made a mistake in front of my team and now they lose respect for me.",
  "I feel anxious so I must be in danger of failing.",
];

interface ReframeOutput {
  evidenceCheck: string;
  balancedPerspective: string;
  actionableStep: string;
}

export function CBTReframer() {
  const [thought, setThought] = useState("");
  const [selectedDistortion, setSelectedDistortion] = useState<string>("catastrophizing");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reframeResult, setReframeResult] = useState<ReframeOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);

  // Speech recognition
  const speechSupported = useSpeechSupported();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (speechSupported) {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          const addition = finalTranscript.trim();
          if (addition) {
            setThought((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${addition}` : addition;
            });
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, [speechSupported]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleGenerate = () => {
    if (!thought.trim() || isGenerating) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsGenerating(true);
    setReframeResult(null);
    setSavedToJournal(false);

    // Simulate smart evidence-based CBT reframing synthesis
    setTimeout(() => {
      const distortion = DISTORTIONS.find((d) => d.id === selectedDistortion) || DISTORTIONS[0];

      let evidence = `While I feel anxious right now, one single moment or challenge does not define my overall ability or future.`;
      let perspective = `Feeling stressed is a natural human response, not evidence of failure. I have overcome challenging moments before.`;
      let step = `Take 3 deep box breaths, focus on what I can control right now, and take one step at a time.`;

      if (distortion.id === "catastrophizing") {
        evidence = `Even if things don't go perfectly, the worst-case scenario is rarely what actually happens.`;
        perspective = `I am equipped to adapt and handle obstacles step by step.`;
        step = `Write down 2 realistic alternative outcomes that are much more likely to happen.`;
      } else if (distortion.id === "all_or_nothing") {
        evidence = `Progress is rarely all-or-nothing. Small efforts still hold value and build success.`;
        perspective = `I can accept partial success as positive growth rather than demanding perfection.`;
        step = `Identify 1 thing that went well, even if the overall outcome wasn't flawless.`;
      } else if (distortion.id === "mind_reading") {
        evidence = `I cannot read minds. Most people are focused on their own responsibilities and thoughts.`;
        perspective = `I can choose self-compassion instead of assuming negative judgments from others.`;
        step = `Focus on my own values and effort rather than trying to control others' perceptions.`;
      }

      setReframeResult({
        evidenceCheck: evidence,
        balancedPerspective: perspective,
        actionableStep: step,
      });

      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!reframeResult) return;
    const textToCopy = `Negative Thought: "${thought}"\nBalanced Reframe: "${reframeResult.balancedPerspective}"\nAction Step: "${reframeResult.actionableStep}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToJournal = () => {
    if (!reframeResult) return;

    addMoodRecord({
      mood: "reframed",
      severity: 3,
      isEmergency: false,
      source: "journal",
      text: `[CBT Reframe]\nThought: "${thought}"\nBalanced Perspective: "${reframeResult.balancedPerspective}"\nAction Step: "${reframeResult.actionableStep}"`,
      tags: ["Reflective", "Calm", "CBT Reframe"],
      energy: 4,
    });

    setSavedToJournal(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Banner */}
      <div className="glass flex items-center justify-between rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <BrainCircuit size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground">CBT Thought Reframer</h2>
            <p className="text-xs text-muted">
              Cognitive Behavioral Therapy workspace to reframe anxious & negative automatic thoughts.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Thought Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted flex items-center gap-1">
          <Sparkles size={13} className="text-amber-500" /> Need an example? Tap to load a thought:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PRESET_THOUGHTS.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setThought(t)}
              className="shrink-0 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition-colors"
            >
              &quot;{t.slice(0, 32)}...&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Box */}
      <div className="glass flex flex-col gap-4 rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            1. Describe Your Automatic Anxious / Negative Thought:
          </label>
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isListening ? "Listening..." : "Dictate Thought"}</span>
            </button>
          )}
        </div>

        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="e.g., I have so much work to complete today and I feel overwhelmed. I'm afraid I'm going to mess everything up..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm outline-none transition-colors focus:border-emerald-500/30 placeholder:text-muted"
        />

        {/* Cognitive Distortion Selector */}
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle size={13} /> 2. Identify Cognitive Distortion Pattern:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DISTORTIONS.map((d) => {
              const isSelected = selectedDistortion === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDistortion(d.id)}
                  className={`flex flex-col gap-1 rounded-2xl p-3 text-left transition-all border ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/15 shadow-xs"
                      : "border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{d.icon}</span>
                    <span className="text-xs font-bold text-foreground">{d.name}</span>
                  </div>
                  <span className="text-[10px] text-muted line-clamp-2">{d.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!thought.trim() || isGenerating}
          className="mt-3 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white dark:text-emerald-950 shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-400 disabled:opacity-40 disabled:hover:scale-100"
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{isGenerating ? "Synthesizing CBT Reframe..." : "Reframe Thought with CBT AI"}</span>
        </button>
      </div>

      {/* Reframe Result Output */}
      {reframeResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex flex-col gap-5 rounded-3xl p-6 sm:p-8 border border-emerald-500/20 dark:bg-emerald-950/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={22} />
              Balanced Cognitive Reframe
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToJournal}
                disabled={savedToJournal}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950 px-3 py-1.5 text-xs font-bold shadow-xs hover:scale-105 transition-all disabled:opacity-60"
              >
                <BookHeart size={14} />
                <span>{savedToJournal ? "Saved to Journal!" : "Save to Journal"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            {/* Reality Check */}
            <div className="flex flex-col gap-1 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                💡 1. Objective Reality Check
              </span>
              <p className="text-foreground/90 leading-relaxed font-medium">
                {reframeResult.evidenceCheck}
              </p>
            </div>

            {/* Balanced Perspective */}
            <div className="flex flex-col gap-1 rounded-2xl bg-teal-500/10 p-4 border border-teal-500/20">
              <span className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                🌿 2. Empowering Balanced Perspective
              </span>
              <p className="text-foreground/90 leading-relaxed font-medium">
                {reframeResult.balancedPerspective}
              </p>
            </div>

            {/* Actionable Grounding Step */}
            <div className="flex flex-col gap-1 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
              <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                🎯 3. Actionable Micro-Step
              </span>
              <p className="text-foreground/90 leading-relaxed font-medium">
                {reframeResult.actionableStep}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
