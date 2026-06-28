/**
 * Push Prisma schema to Turso via @libsql/client.
 * Usage: npx tsx scripts/push-schema.ts
 *
 * Reads DATABASE_URL and DATABASE_AUTH_TOKEN from .env.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

if (url.startsWith("file:")) {
  console.error("DATABASE_URL is a local file. This script is for remote Turso only.");
  console.error("Set DATABASE_URL to libsql://... in .env before running.");
  process.exit(1);
}

const client = createClient({ url, authToken: authToken ?? undefined });

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Untitled Resume',
    "rawText" TEXT NOT NULL,
    "parsedData" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "contentHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "JobDescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT,
    "company" TEXT,
    "rawText" TEXT NOT NULL,
    "parsedData" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "optimizedResume" TEXT,
    "matchAnalysis" TEXT,
    "coverLetter" TEXT,
    "atsScore" INTEGER,
    "jobMatchScore" INTEGER,
    "hiringProbability" INTEGER,
    "overallGrade" TEXT,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "processingTime" INTEGER,
    "changesSummary" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analysis_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobDescription" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "userId" TEXT,
    "resumeId" TEXT,
    "atsScore" INTEGER NOT NULL,
    "jobMatchScore" INTEGER,
    "hiringProbability" INTEGER,
    "overallGrade" TEXT,
    "sectionScores" TEXT,
    "weaknesses" TEXT,
    "recommendations" TEXT,
    "skillGaps" TEXT,
    "exportedPdfUrl" TEXT,
    "exportedDocxUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Analysis_resumeId_idx" ON "Analysis"("resumeId");
CREATE INDEX IF NOT EXISTS "Analysis_userId_idx" ON "Analysis"("userId");
CREATE INDEX IF NOT EXISTS "Analysis_status_idx" ON "Analysis"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Report_analysisId_key" ON "Report"("analysisId");
CREATE INDEX IF NOT EXISTS "Report_userId_idx" ON "Report"("userId");
`;

async function main() {
  console.log(`Pushing schema to: ${url}`);

  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const label = sql.match(/CREATE (TABLE|INDEX) (?:IF NOT EXISTS )?"?(\w+)"?/)?.[0] ?? `statement ${i + 1}`;
    try {
      await client.execute(sql);
      console.log(`  ✓ ${label}`);
    } catch (err) {
      console.error(`  ✗ ${label}`);
      console.error(`    ${err}`);
    }
  }

  console.log("\nDone. Remote Turso database is in sync.");
  client.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
