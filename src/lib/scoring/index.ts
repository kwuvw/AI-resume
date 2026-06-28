import { ResumeData, ScoreBreakdown } from "@/types/resume";
import { ATS_WEIGHTS, JOB_MATCH_WEIGHTS, HIRING_PROBABILITY_WEIGHTS } from "@/constants";

// ─── ATS Score Components ───────────────────────────────────────────────────

function calculateKeywordScore(resumeText: string, jobDescription?: string): number {
  // If no JD, use a basic keyword presence check
  if (!jobDescription) {
    const strongVerbs = [
      "led", "developed", "implemented", "increased", "reduced", "delivered",
      "managed", "created", "improved", "designed", "built", "launched",
    ];
    const found = strongVerbs.filter((v) =>
      resumeText.toLowerCase().includes(v)
    );
    return Math.min(100, 50 + found.length * 8);
  }

  // Extract keywords from JD
  const jdWords = jobDescription
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const resumeLower = resumeText.toLowerCase();

  const matched = jdWords.filter((w) => resumeLower.includes(w));
  const ratio = matched.length / Math.max(jdWords.length, 1);

  return Math.min(100, Math.round(ratio * 120)); // Allow slight over-scoring
}

function calculateFormatScore(resumeData: ResumeData, rawText: string): number {
  let score = 0;

  // Contact info
  if (resumeData.contact.email) score += 15;
  if (resumeData.contact.phone) score += 10;
  if (resumeData.contact.linkedin) score += 10;

  // Action verbs in bullets
  const actionVerbs = [
    "led", "developed", "implemented", "increased", "reduced",
    "managed", "created", "improved", "designed", "built",
  ];
  const allBullets = resumeData.experience.flatMap((e) => e.bullets);
  const bulletsWithVerbs = allBullets.filter((b) =>
    actionVerbs.some((v) => b.toLowerCase().startsWith(v))
  );
  if (allBullets.length > 0) {
    const verbRatio = bulletsWithVerbs.length / allBullets.length;
    score += Math.round(verbRatio * 25);
  }

  // No tables/columns (basic check)
  if (!rawText.includes("\t")) score += 15;

  // Consistent formatting
  if (resumeData.experience.every((e) => e.startDate)) score += 10;
  if (resumeData.education.every((e) => e.year)) score += 5;

  return Math.min(100, score);
}

function calculateSectionScore(resumeData: ResumeData): number {
  let score = 0;
  if (resumeData.summary) score += 20;
  if (resumeData.experience.length > 0) score += 25;
  if (resumeData.education.length > 0) score += 20;
  if (resumeData.skills.length > 0) score += 25;
  if (resumeData.projects.length > 0 || resumeData.certifications.length > 0) score += 10;

  return Math.min(100, score);
}

function calculateQuantificationScore(resumeData: ResumeData): number {
  const allBullets = resumeData.experience.flatMap((e) => e.bullets);
  if (allBullets.length === 0) return 0;

  const quantified = allBullets.filter((b) =>
    /\d+%|\$\d+|\d+ years|\d+ months|\d+ (users|customers|clients|projects|team)/i.test(b)
  );

  return Math.min(100, Math.round((quantified.length / allBullets.length) * 100));
}

function calculateLengthScore(resumeData: ResumeData, wordCount: number): number {
  const totalYears = resumeData.experience.length > 0
    ? estimateYearsExperience(resumeData.experience)
    : 0;

  const idealWords = totalYears > 5 ? 1000 : 500;
  const diff = Math.abs(wordCount - idealWords);

  if (diff <= 100) return 100;
  if (diff <= 200) return 85;
  if (diff <= 300) return 70;
  if (diff <= 500) return 55;
  return 40;
}

function estimateYearsExperience(experience: ResumeData["experience"]): number {
  // Simple heuristic: count number of positions
  return experience.length * 2.5;
}

// ─── Main ATS Score Calculator ──────────────────────────────────────────────

export function calculateATSScore(
  resumeData: ResumeData,
  rawText: string,
  jobDescription?: string
): { score: number; breakdown: ScoreBreakdown } {
  const wordCount = rawText.split(/\s+/).length;

  const breakdown: ScoreBreakdown = {
    keywords: calculateKeywordScore(rawText, jobDescription),
    format: calculateFormatScore(resumeData, rawText),
    sections: calculateSectionScore(resumeData),
    quantification: calculateQuantificationScore(resumeData),
    length: calculateLengthScore(resumeData, wordCount),
  };

  const score = Math.round(
    breakdown.keywords * ATS_WEIGHTS.keywords +
    breakdown.format * ATS_WEIGHTS.format +
    breakdown.sections * ATS_WEIGHTS.sections +
    breakdown.quantification * ATS_WEIGHTS.quantification +
    breakdown.length * ATS_WEIGHTS.length
  );

  return { score: Math.min(100, Math.max(0, score)), breakdown };
}

// ─── Job Match Score Calculator ─────────────────────────────────────────────

export function calculateJobMatchScore(
  aiMatchResult: {
    matched_skills: string[];
    missing_skills: string[];
    overall_match: string;
  } | null,
  resumeData: ResumeData,
  jobDescription?: string | null
): number {
  if (!aiMatchResult || !jobDescription) return 0;

  // Skill match component
  const totalSkills =
    aiMatchResult.matched_skills.length + aiMatchResult.missing_skills.length;
  const skillRatio = totalSkills > 0
    ? aiMatchResult.matched_skills.length / totalSkills
    : 0;
  const skillScore = Math.round(skillRatio * 100);

  // Overall match from AI (as percentage)
  const matchMap: Record<string, number> = {
    strong: 95,
    good: 75,
    fair: 50,
    poor: 25,
  };
  const aiScore = matchMap[aiMatchResult.overall_match] || 50;

  // Combined score
  return Math.round(
    skillScore * JOB_MATCH_WEIGHTS.skills +
    aiScore * JOB_MATCH_WEIGHTS.semantic +
    50 * JOB_MATCH_WEIGHTS.experience + // Default middle if not calculated
    skillScore * JOB_MATCH_WEIGHTS.keywords
  );
}

// ─── Hiring Probability Calculator ──────────────────────────────────────────

export function calculateHiringProbability(
  atsScore: number,
  jobMatchScore: number,
  experienceFit: number = 50
): number {
  if (jobMatchScore === 0) {
    // No JD provided, use only ATS score
    return Math.round(atsScore * 0.6 + 40 * 0.4);
  }

  return Math.min(100, Math.round(
    atsScore * HIRING_PROBABILITY_WEIGHTS.ats +
    jobMatchScore * HIRING_PROBABILITY_WEIGHTS.jobMatch +
    experienceFit * HIRING_PROBABILITY_WEIGHTS.experienceFit
  ));
}

// ─── Skill Gap Analysis ─────────────────────────────────────────────────────

export function calculateSkillGaps(
  resumeSkills: string[],
  matchedSkills: string[],
  missingSkills: string[]
): {
  matched: string[];
  missing: string[];
  partial: Array<{ skill: string; note: string }>;
} {
  return {
    matched: matchedSkills,
    missing: missingSkills,
    partial: [], // Will be populated by AI analysis
  };
}

// ─── Experience Fit Calculator ───────────────────────────────────────────────

export function calculateExperienceFit(
  resumeData: ResumeData,
  requiredYears?: string
): number {
  if (!requiredYears) return 70; // Default neutral

  const yearsMatch = requiredYears.match(/(\d+)/);
  if (!yearsMatch) return 70;

  const required = parseInt(yearsMatch[1]);
  const candidateYears = resumeData.experience.length * 2.5; // Heuristic

  if (candidateYears >= required) return 100;
  if (candidateYears >= required * 0.8) return 80;
  if (candidateYears >= required * 0.6) return 60;
  if (candidateYears >= required * 0.4) return 40;
  return 20;
}
