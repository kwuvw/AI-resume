import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parser";
import { generateId, hashContent } from "@/lib/utils";
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from "@/constants";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const title = (formData.get("title") as string) || "Untitled Resume";

    // Validate input
    if (!file && !text) {
      return NextResponse.json(
        { error: "Either file or text is required" },
        { status: 400 }
      );
    }

    let rawText: string;
    let fileType: string;
    let fileUrl: string | undefined;

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB" },
          { status: 400 }
        );
      }

      // Validate extension
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
        return NextResponse.json(
          { error: "Unsupported file type. Use PDF, DOCX, or TXT" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      fileType = ext.replace(".", "");

      const result = await parseResume(buffer, fileType);
      rawText = result.text;

      // Store the parsed result for later use
      const resumeId = generateId();
      const contentHash = hashContent(rawText);

      const resume = await prisma.resume.create({
        data: {
          id: resumeId,
          title,
          rawText,
          parsedData: JSON.stringify(result.parsed),
          fileType,
          contentHash,
        },
      });

      return NextResponse.json({
        id: resume.id,
        title: resume.title,
        parsedData: result.parsed,
        wordCount: rawText.split(/\s+/).length,
        fileType: resume.fileType,
        createdAt: resume.createdAt.toISOString(),
      });
    }

    // Text input
    if (text) {
      fileType = "text";
      rawText = text;

      const result = await parseResume(Buffer.from(text, "utf-8"), "text");
      const resumeId = generateId();
      const contentHash = hashContent(rawText);

      const resume = await prisma.resume.create({
        data: {
          id: resumeId,
          title,
          rawText,
          parsedData: JSON.stringify(result.parsed),
          fileType,
          contentHash,
        },
      });

      return NextResponse.json({
        id: resume.id,
        title: resume.title,
        parsedData: result.parsed,
        wordCount: rawText.split(/\s+/).length,
        fileType: resume.fileType,
        createdAt: resume.createdAt.toISOString(),
      });
    }

    return NextResponse.json(
      { error: "No input provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
