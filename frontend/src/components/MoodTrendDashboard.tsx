"use client";

import { motion } from "framer-motion";
import { BarChart3, Trash2, Calendar, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearMoodHistory,
  getAverageSeverity,
  getMoodHistory,
  getSeverityTrend,
  type MoodRecord,
} from "@/lib/moodHistory";
import { severityColor, severityLabel } from "@/lib/mood";

export function MoodTrendDashboard() {
  const [records, setRecords] = useState<MoodRecord[]>(() => getMoodHistory().slice().reverse());
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRecords(getMoodHistory().slice().reverse());
  }, []);

  useEffect(() => {
    window.addEventListener("neurawell:mood-updated", refresh);
    return () => window.removeEventListener("neurawell:mood-updated", refresh);
  }, [refresh]);

  // Generate 14 days array ending today
  const fourteenDaysData = useMemo(() => {
    const rawTrend = getSeverityTrend(14);
    const trendMap = new Map(rawTrend.map((item) => [item.date, item]));

    const result = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const existing = trendMap.get(dateStr);

      result.push({
        date: dateStr,
        displayDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        avgSeverity: existing ? existing.avgSeverity : 0,
        count: existing ? existing.count : 0,
      });
    }

    return result;
  }, [records]);

  const avg = useMemo(() => getAverageSeverity(), [records]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header Card */}
      <div className="glass flex items-center justify-between rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2.5 text-base font-semibold text-emerald-600 dark:text-emerald-400">
          <BarChart3 size={20} />
          14-Day Mood Trends
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Calendar size={14} />
          Average Severity:{" "}
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
            {avg ? `${avg}/10` : "No data"}
          </span>
        </div>
      </div>

      {/* 14-Bar Chart Panel */}
      <div className="glass flex flex-col gap-4 rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Daily Mood Severity Score (1-10)</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> 1-4 Green</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> 5-8 Amber</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> 9-10 Red</span>
          </div>
        </div>

        <div className="relative flex h-52 items-end justify-between gap-1.5 pt-8 pb-2 px-1">
          {fourteenDaysData.map((point) => {
            const heightPercent = point.avgSeverity > 0 ? (point.avgSeverity / 10) * 100 : 0;
            const barColor = point.avgSeverity > 0 ? severityColor(point.avgSeverity) : "rgba(16, 185, 129, 0.12)";
            const isHovered = hoveredBar === point.date;

            return (
              <div
                key={point.date}
                className="relative flex flex-1 flex-col items-center group h-full justify-end"
                onMouseEnter={() => setHoveredBar(point.date)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Hover Tooltip */}
                {isHovered && point.avgSeverity > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 z-20 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-center text-[11px] font-semibold text-white shadow-lg dark:bg-emerald-900"
                  >
                    <div>{point.displayDate}: {point.avgSeverity}/10</div>
                    <div className="text-[10px] text-emerald-300 font-normal">
                      {severityLabel(point.avgSeverity)} · {point.count} {point.count === 1 ? "entry" : "entries"}
                    </div>
                  </motion.div>
                )}

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: point.avgSeverity > 0 ? `${heightPercent}%` : "8%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-transform ${
                    isHovered ? "scale-105" : ""
                  }`}
                  style={{
                    background: barColor,
                    opacity: point.avgSeverity > 0 ? 1 : 0.35,
                  }}
                />

                {/* Date Label */}
                <span className="mt-2 text-[10px] font-medium text-muted truncate max-w-full">
                  {point.displayDate.split(" ")[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log Panel */}
      <div className="glass rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Info size={16} className="text-emerald-500" />
            Mood History Log
          </div>
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearMoodHistory();
                refresh();
              }}
              className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
            >
              <Trash2 size={13} />
              Clear History
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">
            No mood history recorded yet. Use the Chat or Journal mode to log how you feel!
          </p>
        ) : (
          <ul className="flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
            {records.slice(0, 30).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl p-3 text-xs border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="capitalize font-bold text-foreground">{r.mood}</span>
                  <span className="text-muted text-[11px]">
                    {new Date(r.timestamp).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · <span className="capitalize font-medium">{r.source}</span>
                  </span>
                  {r.text && (
                    <p className="mt-1 text-[11px] text-muted italic line-clamp-1">
                      &quot;{r.text}&quot;
                    </p>
                  )}
                </div>
                <span
                  className="rounded-full px-3 py-1 font-bold text-xs"
                  style={{
                    color: severityColor(r.severity),
                    backgroundColor: `${severityColor(r.severity)}20`,
                  }}
                >
                  {r.severity}/10
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
