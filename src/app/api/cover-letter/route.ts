import { NextRequest, NextResponse } from "next/server";
import { runCoverLetter } from "@/lib/ai/pipeline";
import { ResumeDataSchema } from "@/types/resume";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, jobDescriptionText, companyName, tone = "professional" } = body;

    if (!resumeId || !jobDescriptionText) {
      return NextResponse.json(
        { error: "resumeId and jobDescriptionText are required" },
        { status: 400 }
      );
    }

    // Fetch resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const parsedData = JSON.parse(resume.parsedData);
    const resumeData = ResumeDataSchema.parse(parsedData);

    // Generate cover letter
    const result = await runCoverLetter(resumeData, jobDescriptionText, companyName);

    // Create analysis record
    const analysisId = generateId();
    await prisma.analysis.create({
      data: {
        id: analysisId,
        resumeId,
        type: "cover_letter",
        status: "completed",
        coverLetter: result.output.cover_letter,
        tokensUsed: result.tokens,
      },
    });

    return NextResponse.json({
      analysisId,
      cover_letter: result.output.cover_letter,
      highlights_used: result.output.highlights_used,
      tokens_used: result.tokens,
    });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
