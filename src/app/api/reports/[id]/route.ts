import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResumeDataSchema } from "@/types/resume";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        analysis: true,
        resume: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const resume = report.resume
      ? ResumeDataSchema.parse(JSON.parse(report.resume.parsedData))
      : null;

    const optimizedResume = report.analysis?.optimizedResume
      ? ResumeDataSchema.parse(JSON.parse(report.analysis.optimizedResume))
      : null;

    return NextResponse.json({
      id: report.id,
      resume,
      job_description: null, // Not stored in report
      scores: {
        ats: report.atsScore,
        ats_breakdown: report.sectionScores ? JSON.parse(report.sectionScores) : null,
        job_match: report.jobMatchScore,
        hiring_probability: report.hiringProbability,
      },
      optimized_resume: optimizedResume,
      weaknesses: report.weaknesses ? JSON.parse(report.weaknesses) : [],
      recommendations: report.recommendations ? JSON.parse(report.recommendations) : [],
      skill_match: report.skillGaps ? JSON.parse(report.skillGaps) : null,
      cover_letter: report.analysis?.coverLetter || null,
      changes_summary: report.analysis?.changesSummary
        ? JSON.parse(report.analysis.changesSummary)
        : [],
      created_at: report.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
