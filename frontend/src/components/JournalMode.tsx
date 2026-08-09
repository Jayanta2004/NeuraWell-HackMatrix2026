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
    setResult(null);

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
    <div className="flex flex-col gap-4">
      {result?.isEmergency && <CrisisBanner />}

      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <BookHeart size={16} />
          Journal entry
        </div>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write freely about your day, your thoughts, or how you're feeling..."
          rows={8}
          className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none placeholder:text-muted"
          style={{ background: "rgba(127,127,127,0.06)" }}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted">{entry.length} characters</span>
          <button
            type="button"
            onClick={submit}
            disabled={loading || !entry.trim()}
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "var(--primary)" }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Analyze entry
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <p className="text-sm text-muted">Detected mood</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-lg font-semibold capitalize">{result.mood}</span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ color: severityColor(result.severity) }}
            >
              {severityLabel(result.severity)} · {result.severity}/10
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
