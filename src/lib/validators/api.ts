import { z } from "zod";

// ─── Upload Resume ──────────────────────────────────────────────────────────

export const UploadResumeSchema = z.object({
  title: z.string().max(255).optional(),
});

export type UploadResumeInput = z.infer<typeof UploadResumeSchema>;

// ─── Analyze Resume ─────────────────────────────────────────────────────────

export const AnalyzeResumeSchema = z.object({
  resumeId: z.string().uuid(),
  type: z.enum(["optimize", "full_analysis"]).default("full_analysis"),
  jobDescriptionId: z.string().uuid().optional(),
  jobDescriptionText: z.string().max(50000).optional(),
});

export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeSchema>;

// ─── Job Match ──────────────────────────────────────────────────────────────

export const JobMatchSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescriptionText: z.string().min(10).max(50000),
  companyName: z.string().max(255).optional(),
});

export type JobMatchInput = z.infer<typeof JobMatchSchema>;

// ─── Cover Letter ───────────────────────────────────────────────────────────

export const CoverLetterSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescriptionText: z.string().min(10).max(50000),
  companyName: z.string().max(255).optional(),
  tone: z.enum(["professional", "enthusiastic", "technical"]).default("professional"),
});

export type CoverLetterInput = z.infer<typeof CoverLetterSchema>;

// ─── Get Report ─────────────────────────────────────────────────────────────

export const GetReportSchema = z.object({
  id: z.string().uuid(),
});

export type GetReportInput = z.infer<typeof GetReportSchema>;

// ─── List Reports ───────────────────────────────────────────────────────────

export const ListReportsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type ListReportsInput = z.infer<typeof ListReportsSchema>;

// ─── Save Job Description ───────────────────────────────────────────────────

export const SaveJobSchema = z.object({
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  rawText: z.string().min(10).max(50000),
  url: z.string().url().optional(),
});

export type SaveJobInput = z.infer<typeof SaveJobSchema>;
