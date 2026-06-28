import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/lib/ai/pipeline";
import { calculateATSScore, calculateJobMatchScore, calculateHiringProbability } from "@/lib/scoring";
import { ResumeDataSchema } from "@/types/resume";
import { prisma } from "@/lib/prisma";
import { generateId, getScoreGrade } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { resumeId, type = "full_analysis", jobDescriptionText, locale = "en" } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    // Fetch resume from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Ownership check: if user is logged in, they can only analyze their own resumes
    if (session && resume.userId && resume.userId !== session.userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Parse stored data
    const parsedData = JSON.parse(resume.parsedData);
    const resumeData = ResumeDataSchema.parse(parsedData);

    // Create analysis record
    const analysisId = generateId();
    await prisma.analysis.create({
      data: {
        id: analysisId,
        resumeId,
        userId: session?.userId ?? null,
        type,
        status: "processing",
      },
    });

    // Run AI analysis
    const startTime = Date.now();
    const result = await runFullAnalysis(resumeData, jobDescriptionText, locale);
    const processingTime = Date.now() - startTime;

    // Calculate scores
    const { score: atsScore, breakdown: atsBreakdown } = calculateATSScore(
      resumeData,
      resume.rawText,
      jobDescriptionText || undefined
    );

    const jobMatchScore = result.match_result
      ? calculateJobMatchScore(result.match_result, resumeData, jobDescriptionText)
      : null;

    const hiringProbability = calculateHiringProbability(
      atsScore,
      jobMatchScore || 0
    );

    const overallGrade = getScoreGrade(atsScore);

    // Update analysis record
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "completed",
        optimizedResume: JSON.stringify(result.optimized_resume),
        matchAnalysis: result.match_result ? JSON.stringify(result.match_result) : null,
        coverLetter: result.cover_letter_result?.cover_letter || null,
        atsScore,
        jobMatchScore,
        hiringProbability,
        overallGrade,
        modelUsed: "gpt-4o-mini",
        tokensUsed: result.total_tokens,
        processingTime,
        changesSummary: JSON.stringify(result.changes_summary),
      },
    });

    // Create report
    const reportId = generateId();
    await prisma.report.create({
      data: {
        id: reportId,
        analysisId,
        userId: session?.userId ?? null,
        resumeId,
        atsScore,
        jobMatchScore,
        hiringProbability,
        overallGrade,
        sectionScores: JSON.stringify(atsBreakdown),
        weaknesses: JSON.stringify(result.weaknesses),
        recommendations: JSON.stringify(result.recommendations),
        skillGaps: result.match_result
          ? JSON.stringify({
              matched: result.match_result.matched_skills,
              missing: result.match_result.missing_skills,
              partial: result.match_result.partial_skills,
            })
          : null,
      },
    });

    return NextResponse.json({
      reportId,
      analysisId,
      scores: {
        ats: atsScore,
        ats_breakdown: atsBreakdown,
        job_match: jobMatchScore,
        hiring_probability: hiringProbability,
      },
      optimized_resume: result.optimized_resume,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      match_result: result.match_result,
      cover_letter: result.cover_letter_result?.cover_letter || null,
      changes_summary: result.changes_summary,
      processing_time: processingTime,
      tokens_used: result.total_tokens,
    });
  } catch (error) {
    console.error("═══════════════════════════════════════════");
    console.error("Groq Pipeline Error:");
    console.error("═══════════════════════════════════════════");

    if (error && typeof error === "object") {
      const e = error as Record<string, unknown>;
      console.error("name:", e.name);
      console.error("message:", e.message);
      console.error("status:", e.status);
      console.error("code:", e.code);
      console.error("type:", e.type);

      // OpenAI SDK errors often nest the response
      if (e.error && typeof e.error === "object") {
        console.error("response body:", JSON.stringify(e.error, null, 2));
      }
      if (e.response && typeof e.response === "object") {
        const resp = e.response as Record<string, unknown>;
        console.error("response status:", resp.status);
        if (resp.body) console.error("response body:", resp.body);
      }
    } else {
      console.error("raw error:", error);
    }

    console.error("stack:", error instanceof Error ? error.stack : "N/A");
    console.error("═══════════════════════════════════════════");

    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to analyze resume", details: message },
      { status: 500 }
    );
  }
}
