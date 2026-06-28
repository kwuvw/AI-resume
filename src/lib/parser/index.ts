import { ResumeData } from "@/types/resume";

// ─── PDF Parsing ────────────────────────────────────────────────────────────

export async function parsePDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

// ─── DOCX Parsing ───────────────────────────────────────────────────────────

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// ─── Text Cleaning ──────────────────────────────────────────────────────────

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Section Detection ──────────────────────────────────────────────────────

const SECTION_PATTERNS = {
  contact: /^(contact|personal\s+info|personal\s+details)/i,
  summary: /^(summary|objective|profile|about\s+me|professional\s+summary)/i,
  experience: /^(experience|work\s+experience|employment|work\s+history|professional\s+experience)/i,
  education: /^(education|academic|qualifications|degrees)/i,
  skills: /^(skills|technical\s+skills|competencies|technologies|core\s+competencies)/i,
  projects: /^(projects|portfolio|personal\s+projects|key\s+projects)/i,
  certifications: /^(certifications|certificates|licenses|credentials)/i,
  languages: /^(languages|language\s+skills)/i,
};

function detectSections(text: string): Record<string, { start: number; end: number }> {
  const lines = text.split("\n");
  const sections: Record<string, { start: number; end: number }> = {};
  const sectionOrder: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line) && line.length < 50) {
        if (sectionOrder.length > 0) {
          const prevSection = sectionOrder[sectionOrder.length - 1];
          if (sections[prevSection]) {
            sections[prevSection].end = i;
          }
        }
        sections[key] = { start: i, end: lines.length };
        sectionOrder.push(key);
        break;
      }
    }
  }

  return sections;
}

// ─── Contact Extraction ─────────────────────────────────────────────────────

function extractContact(text: string): ResumeData["contact"] {
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  const phoneMatch = text.match(
    /(\+?[\d\s\-().]{10,20})/
  );
  const linkedinMatch = text.match(
    /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i
  );
  const websiteMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i
  );

  // Name is typically the first non-empty line
  const lines = text.split("\n").filter((l) => l.trim());
  const name = lines[0]?.trim() || "";

  // Location: look for city/state pattern
  const locationMatch = text.match(
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/
  );

  return {
    name,
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[1]?.trim() || "",
    location: locationMatch?.[1] || "",
    linkedin: linkedinMatch?.[0],
    website: websiteMatch?.[0],
  };
}

// ─── Experience Extraction ──────────────────────────────────────────────────

function extractExperience(sectionText: string): ResumeData["experience"] {
  const entries: ResumeData["experience"] = [];
  const lines = sectionText.split("\n").filter((l) => l.trim());

  let current: Partial<ResumeData["experience"][0]> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Date pattern to detect new entry
    const datePattern =
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4})\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}|[Pp]resent|[Cc]urrent)/;

    if (datePattern.test(trimmed)) {
      if (current?.title) {
        entries.push(current as ResumeData["experience"][0]);
      }
      current = {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      };

      const dateMatch = trimmed.match(datePattern);
      if (dateMatch) {
        const parts = dateMatch[0].split(/[-–—]/);
        current.startDate = parts[0]?.trim() || "";
        current.endDate = parts[1]?.trim() || "";
      }

      // Title and company are usually before the date
      const beforeDate = trimmed.split(datePattern)[0]?.trim();
      if (beforeDate) {
        const parts = beforeDate.split(/[,| at | @ ]/);
        current.title = parts[0]?.trim() || "";
        current.company = parts[1]?.trim() || "";
      }
    } else if (current && !current.title) {
      // Try to extract title/company from a line without dates
      const parts = trimmed.split(/[,| at | @ ]/);
      if (parts.length >= 2) {
        current.title = parts[0]?.trim() || "";
        current.company = parts[1]?.trim() || "";
      } else {
        current.title = trimmed;
      }
    } else if (current) {
      // Bullet point
      const bulletText = trimmed.replace(/^[-•*●→]\s*/, "");
      if (bulletText && current.bullets) {
        current.bullets.push(bulletText);
      }
    }
  }

  if (current?.title) {
    entries.push(current as ResumeData["experience"][0]);
  }

  return entries;
}

// ─── Skills Extraction ──────────────────────────────────────────────────────

function extractSkills(sectionText: string): string[] {
  const skills: string[] = [];
  const lines = sectionText.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-•*●→]\s*/, "");
    // Split by common delimiters
    const parts = trimmed.split(/[,;|\/]/);
    for (const part of parts) {
      const skill = part.trim();
      if (skill && skill.length < 50) {
        skills.push(skill);
      }
    }
  }

  return [...new Set(skills)];
}

// ─── Education Extraction ───────────────────────────────────────────────────

function extractEducation(sectionText: string): ResumeData["education"] {
  const entries: ResumeData["education"] = [];
  const lines = sectionText.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    const degreePatterns =
      /\b(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.Tech|M\.Tech|Associate|Diploma)\b/i;

    if (degreePatterns.test(trimmed) || yearMatch) {
      const parts = trimmed.split(/[,]/);
      entries.push({
        degree: parts[0]?.trim() || trimmed,
        institution: parts[1]?.trim() || "",
        year: yearMatch?.[0] || "",
      });
    }
  }

  return entries;
}

// ─── Main Parsing Function ──────────────────────────────────────────────────

export async function parseResume(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; parsed: ResumeData }> {
  let rawText: string;

  switch (fileType) {
    case "pdf":
      rawText = await parsePDF(buffer);
      break;
    case "docx":
      rawText = await parseDOCX(buffer);
      break;
    case "text":
      rawText = buffer.toString("utf-8");
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  const cleanedText = cleanText(rawText);
  const sections = detectSections(cleanedText);

  const parsed: ResumeData = {
    contact: extractContact(cleanedText),
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
  };

  // Extract sections
  for (const [key, bounds] of Object.entries(sections)) {
    const sectionLines = cleanedText.split("\n").slice(bounds.start, bounds.end);
    const sectionText = sectionLines.join("\n");

    switch (key) {
      case "summary":
        parsed.summary = sectionText
          .replace(/^(summary|objective|profile|about\s+me|professional\s+summary)\s*:?\s*/i, "")
          .trim();
        break;
      case "experience":
        parsed.experience = extractExperience(sectionText);
        break;
      case "education":
        parsed.education = extractEducation(sectionText);
        break;
      case "skills":
        parsed.skills = extractSkills(sectionText);
        break;
    }
  }

  // If no sections detected, try to extract from full text
  if (parsed.experience.length === 0 && parsed.skills.length === 0) {
    parsed.experience = extractExperience(cleanedText);
    parsed.skills = extractSkills(cleanedText);
  }

  return { text: cleanedText, parsed };
}
