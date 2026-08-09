"use client";

import { motion } from "framer-motion";
import {
  BookHeart,
  Flame,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Tag,
  Trash2,
  Zap,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { submitJournalEntry } from "@/lib/api";
import {
  addMoodRecord,
  deleteMoodRecord,
  getJournalEntries,
  getJournalStreak,
  type MoodRecord,
} from "@/lib/moodHistory";
import { severityColor, severityLabel } from "@/lib/mood";
import { CrisisBanner } from "@/components/CrisisBanner";

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

interface JournalModeProps {
  onMoodUpdate: (mood: string, severity: number) => void;
}

interface JournalResult {
  mood: string;
  severity: number;
  isEmergency: boolean;
}

const PROMPTS = [
  { id: "win", label: "🌟 Small Win", text: "What is one small win or positive moment you experienced today?" },
  { id: "release", label: "🧘 Release Worry", text: "What is a thought or worry you can let go of right now?" },
  { id: "body", label: "🌿 Body Check", text: "How does your physical body feel right now? Where are you holding tension?" },
  { id: "energy", label: "⚡ Energy Check", text: "What gave you energy today, and what drained your energy?" },
  { id: "gratitude", label: "🙏 Gratitude", text: "Name 3 things, big or small, that you feel grateful for today." },
];

const TAG_OPTIONS = [
  "Grateful",
  "Stressed",
  "Calm",
  "Anxious",
  "Productive",
  "Tired",
  "Hopeful",
  "Reflective",
];

export function JournalMode({ onMoodUpdate }: JournalModeProps) {
  const [entry, setEntry] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JournalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History & Archive state
  const [journalHistory, setJournalHistory] = useState<MoodRecord[]>(() => getJournalEntries().reverse());
  const [streak, setStreak] = useState<number>(() => getJournalStreak());
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Voice dictation state
  const speechSupported = useSpeechSupported();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const refreshHistory = useCallback(() => {
    setJournalHistory(getJournalEntries().reverse());
    setStreak(getJournalStreak());
  }, []);

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
            setEntry((prev) => {
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

    window.addEventListener("neurawell:mood-updated", refreshHistory);
    return () => window.removeEventListener("neurawell:mood-updated", refreshHistory);
  }, [refreshHistory, speechSupported]);

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePromptClick = (promptText: string) => {
    setEntry((prev) =>
      prev ? `${prev}\n\n[Prompt: ${promptText}]\n` : `[Prompt: ${promptText}]\n`
    );
  };

  const submit = async () => {
    const text = entry.trim();
    if (!text || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitJournalEntry(text);
      const journalResult: JournalResult = {
        mood: res.detected_mood,
        severity: res.severity,
        isEmergency: res.is_emergency,
      };
      setResult(journalResult);
      onMoodUpdate(res.detected_mood, res.severity);

      addMoodRecord({
        mood: res.detected_mood,
        severity: res.severity,
        isEmergency: res.is_emergency,
        source: "journal",
        text,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        energy: energyLevel,
      });

      setEntry("");
      setSelectedTags([]);
      refreshHistory();
    } catch {
      setError("Couldn't reach NeuraWell right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteMoodRecord(id);
    refreshHistory();
  };

  // Word count & read time stats
  const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(wordCount / 200);

  // Filtered entries archive
  const filteredHistory = journalHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesText = item.text?.toLowerCase().includes(q);
    const matchesMood = item.mood.toLowerCase().includes(q);
    const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesText || matchesMood || matchesTags;
  });

  return (
    <div className="flex flex-col gap-6">
      {result?.isEmergency && <CrisisBanner />}

      {/* Header Insights & Streak Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass flex items-center gap-3 rounded-2xl p-4 border border-emerald-500/10 dark:bg-emerald-950/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted font-medium">Journal Streak</span>
            <span className="text-base font-extrabold text-foreground">{streak} Days</span>
          </div>
        </div>

        <div className="glass flex items-center gap-3 rounded-2xl p-4 border border-emerald-500/10 dark:bg-emerald-950/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <BookOpen size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted font-medium">Entries Saved</span>
            <span className="text-base font-extrabold text-foreground">{journalHistory.length}</span>
          </div>
        </div>

        <div className="glass col-span-2 sm:col-span-1 flex items-center gap-3 rounded-2xl p-4 border border-emerald-500/10 dark:bg-emerald-950/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <Zap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted font-medium">Avg Word Count</span>
            <span className="text-base font-extrabold text-foreground">
              {journalHistory.length
                ? Math.round(
                    journalHistory.reduce((sum, h) => sum + (h.text?.split(/\s+/).length || 0), 0) /
                      journalHistory.length
                  )
                : 0}{" "}
              words
            </span>
          </div>
        </div>
      </div>

      {/* Main Journal Editor Box */}
      <div className="glass rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-400">
            <BookHeart size={20} />
            Reflective Journal Editor
          </div>
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? "Stop Voice Recording" : "Start Voice Dictation"}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isListening ? "Listening..." : "Dictate"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Guided Prompts Carousel / Chips */}
        <div className="mb-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            Need Inspiration? Tap a prompt to insert:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePromptClick(p.text)}
                className="shrink-0 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder={
            isListening
              ? "Listening to your voice... Speak your thoughts freely..."
              : "Write freely about your day, your thoughts, or how you're feeling..."
          }
          rows={8}
          className="w-full resize-none rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm outline-none transition-colors focus:border-emerald-500/30 placeholder:text-muted"
        />

        {/* Pre-reflection Tags */}
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted flex items-center gap-1">
            <Tag size={13} /> Attach Emotional Tags (Optional):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selected
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold"
                      : "bg-emerald-500/10 text-muted hover:bg-emerald-500/20"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level Rating */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-500/5 p-3 border border-emerald-500/10">
          <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" /> Current Energy Level:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setEnergyLevel(lvl)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                  energyLevel >= lvl
                    ? "bg-amber-500 text-white dark:text-slate-950 shadow-xs"
                    : "bg-emerald-500/10 text-muted hover:bg-emerald-500/20"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted font-medium">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>~{readTimeMin} min read</span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={loading || !entry.trim()}
            className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white dark:text-emerald-950 shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-400 disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Save & Analyze Mood
          </button>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
      </div>

      {/* Analysis Result Banner */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30"
        >
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Analysis Result</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold capitalize text-foreground">{result.mood}</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  color: severityColor(result.severity),
                  backgroundColor: `${severityColor(result.severity)}20`,
                }}
              >
                {severityLabel(result.severity)} ({result.severity}/10)
              </span>
            </div>
            <span className="text-xs text-muted font-medium">Logged to Mood Trends</span>
          </div>
        </motion.div>
      )}

      {/* Journal Archive & Past Entries */}
      <div className="glass rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BookOpen size={18} className="text-emerald-500" />
            Journal Entry Archive ({journalHistory.length})
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries or tags..."
              className="w-full sm:w-60 rounded-xl bg-emerald-500/10 pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500/40 placeholder:text-muted"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">
            {searchQuery
              ? "No journal entries matching your search."
              : "No journal reflections saved yet. Write your first reflection above!"}
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredHistory.map((item) => {
              const isExpanded = expandedEntryId === item.id;
              const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl p-4 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-bold text-foreground text-sm">
                        {item.mood}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 font-bold text-[11px]"
                        style={{
                          color: severityColor(item.severity),
                          backgroundColor: `${severityColor(item.severity)}20`,
                        }}
                      >
                        {item.severity}/10
                      </span>
                      {item.energy && (
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Zap size={11} /> {item.energy}/5 Energy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted">{dateStr}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {item.text && (
                    <p
                      className={`text-xs text-foreground/90 leading-relaxed font-normal ${
                        !isExpanded ? "line-clamp-2" : ""
                      }`}
                    >
                      {item.text}
                    </p>
                  )}

                  {item.text && item.text.length > 140 && (
                    <button
                      type="button"
                      onClick={() => setExpandedEntryId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 self-start"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          Read Full Entry <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
