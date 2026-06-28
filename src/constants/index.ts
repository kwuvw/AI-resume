// ─── Analysis Types ─────────────────────────────────────────────────────────

export const ANALYSIS_TYPES = {
  OPTIMIZE: "optimize",
  FULL_ANALYSIS: "full_analysis",
  JOB_MATCH: "job_match",
  COVER_LETTER: "cover_letter",
} as const;

export type AnalysisType = (typeof ANALYSIS_TYPES)[keyof typeof ANALYSIS_TYPES];

// ─── Analysis Status ────────────────────────────────────────────────────────

export const ANALYSIS_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// ─── User Plans ─────────────────────────────────────────────────────────────

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const PLAN_LIMITS = {
  free: { analyses: 3, jobMatches: 1, coverLetters: 1 },
  pro: { analyses: 50, jobMatches: 30, coverLetters: 30 },
  enterprise: { analyses: 999, jobMatches: 999, coverLetters: 999 },
} as const;

// ─── File Constraints ───────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;
export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

// ─── AI Models ──────────────────────────────────────────────────────────────

export const AI_MODELS = {
  FAST: "gpt-4o-mini",
  STANDARD: "gpt-4o",
  CHEAP: "gemini-2.0-flash",
} as const;

export const MODEL_TEMPERATURES = {
  FACTUAL: 0.2,
  CREATIVE: 0.5,
  REWRITE: 0.3,
} as const;

// ─── Score Weights ──────────────────────────────────────────────────────────

export const ATS_WEIGHTS = {
  keywords: 0.3,
  format: 0.2,
  sections: 0.2,
  quantification: 0.15,
  length: 0.15,
} as const;

export const JOB_MATCH_WEIGHTS = {
  skills: 0.4,
  experience: 0.3,
  keywords: 0.2,
  semantic: 0.1,
} as const;

export const HIRING_PROBABILITY_WEIGHTS = {
  ats: 0.4,
  jobMatch: 0.4,
  experienceFit: 0.2,
} as const;
