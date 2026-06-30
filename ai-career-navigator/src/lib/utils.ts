import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getATSColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#ef4444";
  return "#6b7280";
}

export function getATSLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

export const JOB_STATUSES = [
  "Applied",
  "Screening",
  "Technical Interview",
  "HR Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  Applied: "#6366f1",
  Screening: "#f59e0b",
  "Technical Interview": "#3b82f6",
  "HR Interview": "#8b5cf6",
  Offer: "#10b981",
  Hired: "#059669",
  Rejected: "#ef4444",
};
