import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: {
          analysis: {
            select: {
              id: true,
              type: true,
              coverLetter: true,
              matchAnalysis: true,
              changesSummary: true,
            },
          },
          resume: {
            select: {
              id: true,
              title: true,
              fileType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count(),
    ]);

    return NextResponse.json({
      reports: reports.map((r: typeof reports[0]) => ({
        id: r.id,
        ats_score: r.atsScore,
        job_match_score: r.jobMatchScore,
        hiring_probability: r.hiringProbability,
        overall_grade: r.overallGrade,
        resume: r.resume,
        analysis_type: r.analysis?.type,
        has_cover_letter: !!r.analysis?.coverLetter,
        created_at: r.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
