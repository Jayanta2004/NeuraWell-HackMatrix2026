"use client";

import { motion } from "framer-motion";
import { BarChart3, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearMoodHistory,
  getAverageSeverity,
  getMoodHistory,
  getSeverityTrend,
  type MoodRecord,
} from "@/lib/moodHistory";
import { severityColor } from "@/lib/mood";

export function MoodTrendDashboard() {
  const [records, setRecords] = useState<MoodRecord[]>(() => getMoodHistory().slice().reverse());
  const [trend, setTrend] = useState(() => getSeverityTrend());
  const [avg, setAvg] = useState(() => getAverageSeverity());

  const refresh = () => {
    setRecords(getMoodHistory().slice().reverse());
    setTrend(getSeverityTrend());
    setAvg(getAverageSeverity());
  };

  useEffect(() => {
    window.addEventListener("neurawell:mood-updated", refresh);
    return () => window.removeEventListener("neurawell:mood-updated", refresh);
  }, []);

  const maxSeverity = Math.max(1, ...trend.map((t) => t.avgSeverity));

  return (
    <div className="flex flex-col gap-5">
      <div className="glass flex items-center justify-between rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BarChart3 size={16} />
          Mood trend (last 14 days)
        </div>
        <div className="text-xs text-muted">
          Avg severity <span className="font-semibold text-foreground">{avg || "—"}</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        {trend.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No mood data yet — chat or journal to start tracking trends.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-2">
            {trend.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.avgSeverity / maxSeverity) * 100}%` }}
                  className="w-full min-h-[4px] rounded-t-md"
                  style={{ background: severityColor(point.avgSeverity) }}
                  title={`${point.date}: ${point.avgSeverity}`}
                />
                <span className="text-[10px] text-muted">
                  {point.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Recent history</span>
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearMoodHistory();
                refresh();
              }}
              className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nothing recorded yet.</p>
        ) : (
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {records.slice(0, 30).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                style={{ background: "rgba(127,127,127,0.06)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="capitalize font-medium">{r.mood}</span>
                  <span className="text-muted">
                    {new Date(r.timestamp).toLocaleString()} · {r.source}
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-1 font-semibold"
                  style={{ color: severityColor(r.severity) }}
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
