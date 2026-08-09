"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  Leaf,
  BarChart3,
  BookOpen,
} from "lucide-react";
import {
  getAverageSeverity,
  getJournalEntries,
  getJournalStreak,
  getMoodHistory,
  getSeverityTrend,
} from "@/lib/moodHistory";
import { severityLabel } from "@/lib/mood";

interface WellnessReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WellnessReportModal({ isOpen, onClose }: WellnessReportModalProps) {
  if (!isOpen) return null;

  const moodHistory = getMoodHistory();
  const journalEntries = getJournalEntries();
  const avgSeverity = getAverageSeverity();
  const streak = getJournalStreak();
  const trend = getSeverityTrend(14);

  // Extract top tags
  const tagCounts = new Map<string, number>();
  moodHistory.forEach((item) => {
    item.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

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
          className="relative z-10 flex w-full max-w-2xl flex-col gap-6 rounded-3xl p-6 sm:p-8 bg-slate-900 border border-emerald-500/20 text-white shadow-2xl max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:p-0 print:border-none print:shadow-none"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 print:border-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 print:bg-emerald-600 print:text-white">
                <Leaf size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white print:text-black">
                  NeuraWell — Therapist & Self-Care Report
                </h2>
                <p className="text-xs text-emerald-300 print:text-emerald-800">
                  Comprehensive 14-Day Mental Wellness Summary
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <Printer size={14} />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Report Metadata Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col gap-1 rounded-2xl bg-white/5 p-3 border border-white/10 print:border-slate-300">
              <span className="text-white/60 print:text-slate-600 font-medium">Report Date</span>
              <span className="font-bold text-white print:text-black">
                {new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-white/5 p-3 border border-white/10 print:border-slate-300">
              <span className="text-white/60 print:text-slate-600 font-medium">14-Day Mood Avg</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700">
                {avgSeverity ? `${avgSeverity}/10 (${severityLabel(avgSeverity)})` : "No data"}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-white/5 p-3 border border-white/10 print:border-slate-300">
              <span className="text-white/60 print:text-slate-600 font-medium">Journal Reflections</span>
              <span className="font-bold text-white print:text-black">{journalEntries.length} Saved</span>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-white/5 p-3 border border-white/10 print:border-slate-300">
              <span className="text-white/60 print:text-slate-600 font-medium">Active Streak</span>
              <span className="font-bold text-amber-400 print:text-amber-700">{streak} Days 🔥</span>
            </div>
          </div>

          {/* Top Emotional Tags */}
          {topTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/80 print:text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-400" /> Top Emotional Themes & Tags:
              </span>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300"
                  >
                    #{tag} ({count}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 14-Day Severity Trend Summary */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white/80 print:text-slate-700 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-emerald-400" /> Daily Mood Severity Log (Past 14 Days):
            </span>

            {trend.length === 0 ? (
              <p className="text-xs text-white/60 italic">No mood data recorded in the last 14 days.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {trend.map((t) => (
                  <div
                    key={t.date}
                    className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/10 print:border-slate-300"
                  >
                    <span className="text-white/70 print:text-slate-700 font-medium">{t.date}</span>
                    <span className="font-bold text-emerald-400 print:text-emerald-800">
                      {t.avgSeverity}/10
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Journal Reflections Summary */}
          {journalEntries.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-white/80 print:text-slate-700 flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" /> Recent Reflections Log:
              </span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {journalEntries.slice(-5).reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-xl bg-white/5 p-3 border border-white/10 text-xs print:border-slate-300"
                  >
                    <div className="flex items-center justify-between font-bold text-white/90 print:text-black">
                      <span className="capitalize">{entry.mood} ({entry.severity}/10)</span>
                      <span className="text-[11px] text-white/50 print:text-slate-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.text && (
                      <p className="text-white/70 print:text-slate-700 italic line-clamp-2">
                        &quot;{entry.text}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-white/50 print:border-black/20 print:text-slate-600">
            <span>Generated automatically by NeuraWell AI Wellness System.</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Confidential Clinical Format
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
