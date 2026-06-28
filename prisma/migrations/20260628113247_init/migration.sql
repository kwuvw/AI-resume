-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Resume" (
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

-- CreateTable
CREATE TABLE "JobDescription" (
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

-- CreateTable
CREATE TABLE "Analysis" (
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

-- CreateTable
CREATE TABLE "Report" (
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Analysis_resumeId_idx" ON "Analysis"("resumeId");

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE INDEX "Analysis_status_idx" ON "Analysis"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Report_analysisId_key" ON "Report"("analysisId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");
