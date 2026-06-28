import { ResumeData, ATSOutput, JobMatchOutput, CoverLetterOutput, Weakness, Recommendation } from "@/types/resume";
import { callAI } from "./client";
import {
  getATSOptimizationPrompt,
  getJobMatchPrompt,
  getCoverLetterPrompt,
  getWeaknessDetectionPrompt,
  getAnalysisSystemPrompt,
  buildATSPrompt,
  buildJobMatchPrompt,
  buildCoverLetterPrompt,
  buildWeaknessPrompt,
} from "./prompts";
import { AI_MODELS, MODEL_TEMPERATURES } from "@/constants";

// ─── Validation ─────────────────────────────────────────────────────────────

function validateOutput<T>(data: T, schema: { parse: (v: unknown) => T }): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("AI output validation failed:", error);
    throw new Error("AI output did not match expected schema");
  }
}

// ─── ATS Optimization Pipeline ──────────────────────────────────────────────

export async function runATSOptimization(
  resumeData: ResumeData
): Promise<{ output: ATSOutput; tokens: number }> {
  const systemPrompt = getATSOptimizationPrompt();
  const userPrompt = buildATSPrompt(resumeData);

  const { data, tokens } = await callAI<ATSOutput>(systemPrompt, userPrompt, {
    model: AI_MODELS.FAST,
    temperature: MODEL_TEMPERATURES.REWRITE,
    maxTokens: 4000,
  });

  // Validate output
  const validated = validateOutput(data, {
    parse: (v: unknown) => v as ATSOutput,
  });

  return { output: validated, tokens };
}

// ─── Job Match Pipeline ─────────────────────────────────────────────────────

export async function runJobMatch(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{ output: JobMatchOutput; tokens: number }> {
  const systemPrompt = getJobMatchPrompt();
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
  companyName?: string
): Promise<{ output: CoverLetterOutput; tokens: number }> {
  const systemPrompt = getCoverLetterPrompt();
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
  resumeData: ResumeData
): Promise<{ weaknesses: Weakness[]; recommendations: Recommendation[]; tokens: number }> {
  const systemPrompt = getWeaknessDetectionPrompt();
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
  jobDescription?: string | null
): Promise<FullAnalysisResult> {
  const totalTokens = { value: 0 };

  // Step 1: ATS Optimization (always runs)
  const atsResult = await runATSOptimization(resumeData);
  totalTokens.value += atsResult.tokens;

  // Step 2: Weakness Detection (always runs)
  const weaknessResult = await runWeaknessDetection(resumeData);
  totalTokens.value += weaknessResult.tokens;

  // Step 3: Job Match + Cover Letter (only if JD provided)
  let matchResult: JobMatchOutput | null = null;
  let coverLetterResult: CoverLetterOutput | null = null;

  if (jobDescription) {
    const [match, coverLetter] = await Promise.all([
      runJobMatch(resumeData, jobDescription),
      runCoverLetter(resumeData, jobDescription),
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
