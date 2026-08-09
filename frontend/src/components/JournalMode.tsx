"use client";

import { motion } from "framer-motion";
import { BookHeart, Loader2 } from "lucide-react";
import { useState } from "react";
import { submitJournalEntry } from "@/lib/api";
import { addMoodRecord } from "@/lib/moodHistory";
import { severityColor, severityLabel } from "@/lib/mood";
import { CrisisBanner } from "@/components/CrisisBanner";

interface JournalModeProps {
  onMoodUpdate: (mood: string, severity: number) => void;
}

interface JournalResult {
  mood: string;
  severity: number;
  isEmergency: boolean;
}

export function JournalMode({ onMoodUpdate }: JournalModeProps) {
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JournalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const text = entry.trim();
    if (!text || loading) return;

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
      });
      setEntry("");
    } catch {
      setError("Couldn't reach NeuraWell right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {result?.isEmergency && <CrisisBanner />}

      <div className="glass rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <BookHeart size={18} />
            Private Reflective Journal
          </div>
          <span className="text-xs text-muted">Confidential space</span>
        </div>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write freely about your day, your thoughts, or how you're feeling... NeuraWell will process your reflection into your mood trends without starting a conversation."
          rows={9}
          className="w-full resize-none rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm outline-none transition-colors focus:border-emerald-500/30 placeholder:text-muted"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted">{entry.length} characters</span>
          <button
            type="button"
            onClick={submit}
            disabled={loading || !entry.trim()}
            className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white dark:text-emerald-950 shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-400 disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Save Reflection & Analyze Mood
          </button>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
      </div>

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
    </div>
  );
}
