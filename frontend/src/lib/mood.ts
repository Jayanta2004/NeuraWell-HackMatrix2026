export function severityLabel(severity: number): string {
  if (severity >= 9) return "Crisis";
  if (severity >= 5) return "Acute";
  return "Stable";
}

export function severityColor(severity: number): string {
  if (severity >= 9) return "var(--danger)";
  if (severity >= 5) return "#d97706";
  return "var(--primary)";
}

export function severityBg(severity: number): string {
  if (severity >= 9) return "var(--danger-bg)";
  if (severity >= 5) return "rgba(217, 119, 6, 0.12)";
  return "rgba(16, 185, 129, 0.12)";
}
