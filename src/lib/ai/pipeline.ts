import { ResumeData, ATSOutput, JobMatchOutput, CoverLetterOutput, Weakness, Recommendation } from "@/types/resume";
import { callAI } from "./client";
import {
  getATSOptimizationPrompt,
  getJobMatchPrompt,
  getCoverLetterPrompt,
  getWeaknessDetectionPrompt,
  buildATSPrompt,
  buildJobMatchPrompt,
  buildCoverLetterPrompt,
  buildWeaknessPrompt,
} from "./prompts";
import { AI_MODELS, MODEL_TEMPERATURES } from "@/constants";

type Locale = "en" | "ru";

// ─── Language instruction injector ──────────────────────────────────────────

function langInstruction(locale: Locale): string {
  if (locale === "ru") {
    return `
CRITICAL LANGUAGE RULE: You MUST write ALL output text entirely in fluent Russian (русский язык).
This includes: every string inside "changes_summary", every "text" field in "weaknesses" and "recommendations",
the "cover_letter" body, all "note" fields, and all "recommendations" strings.
Do NOT mix English and Russian. Every single text field must be 100% Russian.
The resume content itself (names, companies, skills) should stay as-is if originally in English.
`;
  }
  return "";
}

// ─── ATS Optimization Pipeline ──────────────────────────────────────────────

export async function runATSOptimization(
  resumeData: ResumeData,
  locale: Locale = "en"
): Promise<{ output: ATSOutput; tokens: number }> {
  const systemPrompt = getATSOptimizationPrompt() + langInstruction(locale);
  const userPrompt = buildATSPrompt(resumeData);

  const { data, tokens } = await callAI<ATSOutput>(systemPrompt, userPrompt, {
    model: AI_MODELS.FAST,
    temperature: MODEL_TEMPERATURES.REWRITE,
    maxTokens: 4000,
  });

  return { output: data, tokens };
}

// ─── Job Match Pipeline ─────────────────────────────────────────────────────

export async function runJobMatch(
  resumeData: ResumeData,
  jobDescription: string,
  locale: Locale = "en"
): Promise<{ output: JobMatchOutput; tokens: number }> {
  const systemPrompt = getJobMatchPrompt() + langInstruction(locale);
  const userPrompt = buildJobMatchPrompt(resumeData, jobDescription);

  const { data, tokens } = await callAI<JobMatchOutput>(systemPrompt, userPrompt, {
    model: AI_MODELS.STANDARD,
    temperature: MODEL_TEMPERATURES.FACTUAL,
    maxTokens: 3000,
  });

  return { output: data, tokens };
}

// ─── Cover Letter Pipeline ──────────────────────────────────────────────────

export async function runCoverLetter(
  resumeData: ResumeData,
  jobDescription: string,
  companyName?: string,
  locale: Locale = "en"
): Promise<{ output: CoverLetterOutput; tokens: number }> {
  const systemPrompt = getCoverLetterPrompt() + langInstruction(locale);
  const userPrompt = buildCoverLetterPrompt(resumeData, jobDescription, companyName);

  const { data, tokens } = await callAI<CoverLetterOutput>(systemPrompt, userPrompt, {
    model: AI_MODELS.FAST,
    temperature: MODEL_TEMPERATURES.CREATIVE,
    maxTokens: 2000,
  });

  return { output: data, tokens };
}

// ─── Weakness Detection Pipeline ────────────────────────────────────────────

export async function runWeaknessDetection(
  resumeData: ResumeData,
  locale: Locale = "en"
): Promise<{ weaknesses: Weakness[]; recommendations: Recommendation[]; tokens: number }> {
  const systemPrompt = getWeaknessDetectionPrompt() + langInstruction(locale);
  const userPrompt = buildWeaknessPrompt(resumeData);

  const { data, tokens } = await callAI<{
    weaknesses: Weakness[];
    recommendations: Recommendation[];
  }>(systemPrompt, userPrompt, {
    model: AI_MODELS.FAST,
    temperature: MODEL_TEMPERATURES.FACTUAL,
    maxTokens: 2000,
  });

  return { weaknesses: data.weaknesses, recommendations: data.recommendations, tokens };
}

// ─── Full Analysis Pipeline ─────────────────────────────────────────────────

export interface FullAnalysisResult {
  optimized_resume: ResumeData;
  changes_summary: string[];
  weaknesses: Weakness[];
  recommendations: Recommendation[];
  match_result: JobMatchOutput | null;
  cover_letter_result: CoverLetterOutput | null;
  total_tokens: number;
}

export async function runFullAnalysis(
  resumeData: ResumeData,
  jobDescription?: string | null,
  locale: Locale = "en"
): Promise<FullAnalysisResult> {
  const totalTokens = { value: 0 };

  const atsResult = await runATSOptimization(resumeData, locale);
  totalTokens.value += atsResult.tokens;

  const weaknessResult = await runWeaknessDetection(resumeData, locale);
  totalTokens.value += weaknessResult.tokens;

  let matchResult: JobMatchOutput | null = null;
  let coverLetterResult: CoverLetterOutput | null = null;

  if (jobDescription) {
    const [match, coverLetter] = await Promise.all([
      runJobMatch(resumeData, jobDescription, locale),
      runCoverLetter(resumeData, jobDescription, undefined, locale),
    ]);
    matchResult = match.output;
    coverLetterResult = coverLetter.output;
    totalTokens.value += match.tokens + coverLetter.tokens;
  }

  return {
    optimized_resume: atsResult.output.optimized_resume,
    changes_summary: atsResult.output.changes_summary,
    weaknesses: weaknessResult.weaknesses,
    recommendations: weaknessResult.recommendations,
    match_result: matchResult,
    cover_letter_result: coverLetterResult,
    total_tokens: totalTokens.value,
  };
}
