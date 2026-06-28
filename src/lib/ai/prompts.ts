import { ResumeData } from "@/types/resume";

// ─── Schema preamble (prepended to every JSON-mode prompt) ──────────────────

const JSON_ONLY =
  "IMPORTANT: Return ONLY a single valid JSON object. No markdown fences, no commentary, no text outside the JSON.";

// ─── ATS Optimization Prompt ────────────────────────────────────────────────

export function getATSOptimizationPrompt(): string {
  return `You are an expert ATS-optimized resume writer with 15 years of experience.
${JSON_ONLY}

TASK: Improve the resume text to maximize ATS (Applicant Tracking System) compatibility.

RULES:
1. Use strong action verbs (Led, Developed, Implemented, Increased, Reduced, Delivered)
2. Quantify achievements where possible using realistic metrics
3. Keep bullet points concise (max 2 lines each)
4. Maintain factual accuracy — do NOT invent metrics, companies, or roles
5. Preserve the original structure and section order
6. Use standard section headings (Summary, Experience, Education, Skills)
7. Avoid tables, columns, headers/footers, special characters
8. Maximum 30% text change per section (conservative rewrite)

OUTPUT SCHEMA (match exactly):
{
  "optimized_resume": {
    "contact": { "name": "...", "email": "...", "phone": "...", "location": "...", "linkedin": "...", "website": "..." },
    "summary": "improved professional summary",
    "experience": [{ "title": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "bullets": ["..."] }],
    "education": [{ "degree": "...", "institution": "...", "year": "...", "gpa": "..." }],
    "skills": ["..."],
    "certifications": [],
    "languages": [],
    "projects": []
  },
  "changes_summary": ["..."]
}

CRITICAL CONSTRAINTS:
- Never invent job titles, companies, or dates
- Never add skills the candidate didn't mention
- Preserve ALL factual content exactly as provided`;
}

// ─── Job Match Prompt ───────────────────────────────────────────────────────

export function getJobMatchPrompt(): string {
  return `You are an expert recruiter analyzing candidate-job fit with 20 years of experience.
${JSON_ONLY}

TASK: Analyze how well the resume matches the job description.

ANALYSIS STEPS:
1. Extract REQUIRED skills from the job description
2. Extract REQUIRED experience level from the job description
3. Map resume skills to required skills (match/missing/partial)
4. Assess experience level alignment
5. Identify keyword gaps
6. Rate overall match

OUTPUT SCHEMA (match exactly):
{
  "overall_match": "strong" | "good" | "fair" | "poor",
  "matched_skills": ["..."],
  "missing_skills": ["..."],
  "partial_skills": [{ "skill": "...", "note": "..." }],
  "experience_match": { "required": "...", "candidate_has": "...", "assessment": "above_level" | "at_level" | "below_level" },
  "keyword_gaps": ["..."],
  "recommendations": ["..."]
}

RULES:
- Be honest about mismatches — do not sugarcoat
- Distinguish between "nice to have" and "must have" from the JD
- Focus on actionable recommendations
- Consider transferable skills`;
}

// ─── Cover Letter Prompt ────────────────────────────────────────────────────

export function getCoverLetterPrompt(): string {
  return `You are a professional cover letter writer who has helped thousands of candidates land interviews.
${JSON_ONLY}

TASK: Generate a tailored cover letter for the specific job application.

STRUCTURE:
1. Opening hook — mention the specific role and company
2. Why this company — show genuine interest and research
3. Relevant experience — highlight 2-3 most relevant achievements
4. Value proposition — what unique value the candidate brings
5. Call to action — professional closing

OUTPUT SCHEMA (match exactly):
{
  "cover_letter": "full text of the cover letter (max 400 words)",
  "highlights_used": ["which resume points were emphasized"]
}

RULES:
- Maximum 400 words
- Professional but not generic
- Must reference specific requirements from the job description
- Must reference specific achievements from the resume
- Do NOT use generic phrases like "I am writing to express my interest"
- Do NOT repeat the resume — complement it
- Use the candidate's actual name and contact info`;
}

// ─── Weakness Detection Prompt ──────────────────────────────────────────────

export function getWeaknessDetectionPrompt(): string {
  return `You are a career coach who specializes in resume optimization.
${JSON_ONLY}

TASK: Identify weaknesses and areas for improvement in this resume.

OUTPUT SCHEMA (match exactly):
{
  "weaknesses": [{ "text": "...", "severity": "critical" | "warning" | "info", "section": "..." }],
  "recommendations": [{ "text": "...", "priority": 1, "effort": "low" | "medium" | "high" }]
}

SEVERITY GUIDELINES:
- critical: Will definitely hurt chances (missing contact info, no experience section)
- warning: Likely to hurt chances (no quantified achievements, vague bullet points)
- info: Minor improvement opportunity (could add more skills, summary could be shorter)

PRIORITIZATION:
- Quick wins (low effort, high impact) first
- Major improvements last

Be specific and actionable — not generic advice.`;
}

// ─── System Prompt for General Analysis ─────────────────────────────────────

export function getAnalysisSystemPrompt(): string {
  return `You are an AI resume analysis system. You must:
1. Return ONLY valid JSON — no markdown code fences, no explanations outside JSON
2. The JSON must match the exact schema specified in the user prompt
3. Be factual and conservative — never invent information
4. Base all assessments on evidence from the resume
5. Use structured output schemas exactly as specified
6. If information is missing, use empty arrays or null — do not guess
7. Never wrap JSON in \`\`\`json blocks — output raw JSON only`;
}

// ─── Prompt Builder ─────────────────────────────────────────────────────────

export function buildATSPrompt(resumeData: ResumeData): string {
  return `RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

EXPECTED OUTPUT SCHEMA:
{
  "optimized_resume": { "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" }, "summary": "", "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "bullets": [""] }], "education": [{ "degree": "", "institution": "", "year": "", "gpa": "" }], "skills": [""], "certifications": [], "languages": [], "projects": [] },
  "changes_summary": [""]
}

Return ONLY valid JSON matching the schema above.`;
}

export function buildJobMatchPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  return `RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

EXPECTED OUTPUT SCHEMA:
{
  "overall_match": "strong" | "good" | "fair" | "poor",
  "matched_skills": [""],
  "missing_skills": [""],
  "partial_skills": [{ "skill": "", "note": "" }],
  "experience_match": { "required": "", "candidate_has": "", "assessment": "above_level" | "at_level" | "below_level" },
  "keyword_gaps": [""],
  "recommendations": [""]
}

Return ONLY valid JSON matching the schema above.`;
}

export function buildCoverLetterPrompt(
  resumeData: ResumeData,
  jobDescription: string,
  companyName?: string
): string {
  return `RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY: ${companyName}` : ""}

EXPECTED OUTPUT SCHEMA:
{
  "cover_letter": "full cover letter text",
  "highlights_used": [""]
}

Return ONLY valid JSON matching the schema above.`;
}

export function buildWeaknessPrompt(resumeData: ResumeData): string {
  return `RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

EXPECTED OUTPUT SCHEMA:
{
  "weaknesses": [{ "text": "", "severity": "critical" | "warning" | "info", "section": "" }],
  "recommendations": [{ "text": "", "priority": 1, "effort": "low" | "medium" | "high" }]
}

Return ONLY valid JSON matching the schema above.`;
}
