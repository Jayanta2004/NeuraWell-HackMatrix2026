export function severityLabel(severity: number): string {
  if (severity >= 9) return "Crisis";
  if (severity >= 5) return "Elevated";
  return "Stable";
}

export function severityColor(severity: number): string {
  if (severity >= 9) return "#ef4444"; // Red (9-10)
  if (severity >= 5) return "#f59e0b"; // Amber (5-8)
  return "#10b981"; // Green (1-4)
}

export function severityBg(severity: number): string {
  if (severity >= 9) return "rgba(239, 68, 68, 0.15)";
  if (severity >= 5) return "rgba(245, 158, 11, 0.15)";
  return "rgba(16, 185, 129, 0.15)";
}
