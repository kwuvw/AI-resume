import { NextRequest, NextResponse } from "next/server";
import { runJobMatch, runCoverLetter } from "@/lib/ai/pipeline";
import { calculateJobMatchScore, calculateExperienceFit } from "@/lib/scoring";
import { ResumeDataSchema } from "@/types/resume";
import { prisma } from "@/lib/prisma";
import { generateId, getScoreGrade } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, jobDescriptionText, companyName, type = "job_match" } = body;

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

    // Run job match
    const matchResult = await runJobMatch(resumeData, jobDescriptionText);

    // Calculate scores
    const jobMatchScore = calculateJobMatchScore(
      matchResult.output,
      resumeData,
      jobDescriptionText
    );

    const experienceFit = calculateExperienceFit(resumeData);

    // Create analysis record
    const analysisId = generateId();
    await prisma.analysis.create({
      data: {
        id: analysisId,
        resumeId,
        type,
        status: "completed",
        matchAnalysis: JSON.stringify(matchResult.output),
        jobMatchScore,
        tokensUsed: matchResult.tokens,
      },
    });

    return NextResponse.json({
      analysisId,
      match_result: matchResult.output,
      job_match_score: jobMatchScore,
      experience_fit: experienceFit,
      tokens_used: matchResult.tokens,
    });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: "Failed to match job" },
      { status: 500 }
    );
  }
}
