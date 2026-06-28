import { z } from "zod";

// ─── Resume Section Schemas ─────────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().default(""),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
  gpa: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
});

export const ResumeDataSchema = z.object({
  contact: ContactSchema,
  summary: z.string().default(""),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  projects: z.array(ProjectSchema).default([]),
});

export type Contact = z.infer<typeof ContactSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;

// ─── Analysis Result Schemas ────────────────────────────────────────────────

export const WeaknessSchema = z.object({
  text: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  section: z.string(),
});

export const RecommendationSchema = z.object({
  text: z.string(),
  priority: z.number(),
  effort: z.enum(["low", "medium", "high"]),
});

export const SkillMatchResultSchema = z.object({
  matched: z.array(z.string()),
  missing: z.array(z.string()),
  partial: z.array(
    z.object({
      skill: z.string(),
      note: z.string(),
    })
  ),
});

export const ATSOutputSchema = z.object({
  optimized_resume: ResumeDataSchema,
  changes_summary: z.array(z.string()),
});

export const JobMatchOutputSchema = z.object({
  overall_match: z.enum(["strong", "good", "fair", "poor"]),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  partial_skills: z.array(
    z.object({
      skill: z.string(),
      note: z.string(),
    })
  ),
  experience_match: z.object({
    required: z.string(),
    candidate_has: z.string(),
    assessment: z.string(),
  }),
  keyword_gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const CoverLetterOutputSchema = z.object({
  cover_letter: z.string(),
  highlights_used: z.array(z.string()),
});

// ─── Score Schemas ──────────────────────────────────────────────────────────

export const ScoreBreakdownSchema = z.object({
  keywords: z.number().min(0).max(100),
  format: z.number().min(0).max(100),
  sections: z.number().min(0).max(100),
  quantification: z.number().min(0).max(100),
  length: z.number().min(0).max(100),
});

export const ScoresSchema = z.object({
  ats: z.number().min(0).max(100),
  ats_breakdown: ScoreBreakdownSchema,
  job_match: z.number().min(0).max(100).nullable(),
  hiring_probability: z.number().min(0).max(100),
});

// ─── Full Report Schema ─────────────────────────────────────────────────────

export const ReportSchema = z.object({
  id: z.string(),
  resume: ResumeDataSchema,
  job_description: z.string().nullable(),
  scores: ScoresSchema,
  optimized_resume: ResumeDataSchema,
  weaknesses: z.array(WeaknessSchema),
  recommendations: z.array(RecommendationSchema),
  skill_match: SkillMatchResultSchema.nullable(),
  cover_letter: z.string().nullable(),
  changes_summary: z.array(z.string()),
  created_at: z.string(),
});

export type Weakness = z.infer<typeof WeaknessSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type SkillMatchResult = z.infer<typeof SkillMatchResultSchema>;
export type ATSOutput = z.infer<typeof ATSOutputSchema>;
export type JobMatchOutput = z.infer<typeof JobMatchOutputSchema>;
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type Scores = z.infer<typeof ScoresSchema>;
export type Report = z.infer<typeof ReportSchema>;
