-- CreateTable
CREATE TABLE "CandidateNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateRating" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "tags" TEXT[],
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardLayout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layoutName" TEXT NOT NULL DEFAULT 'Default',
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedFilter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filterConfig" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateNote_applicationId_idx" ON "CandidateNote"("applicationId");

-- CreateIndex
CREATE INDEX "CandidateNote_authorId_idx" ON "CandidateNote"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateRating_applicationId_key" ON "CandidateRating"("applicationId");

-- CreateIndex
CREATE INDEX "CandidateRating_applicationId_idx" ON "CandidateRating"("applicationId");

-- CreateIndex
CREATE INDEX "CandidateRating_assignedToId_idx" ON "CandidateRating"("assignedToId");

-- CreateIndex
CREATE INDEX "CandidateRating_rating_idx" ON "CandidateRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardLayout_userId_key" ON "DashboardLayout"("userId");

-- CreateIndex
CREATE INDEX "SavedFilter_userId_idx" ON "SavedFilter"("userId");

-- CreateIndex
CREATE INDEX "SavedFilter_isDefault_idx" ON "SavedFilter"("isDefault");

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateRating" ADD CONSTRAINT "CandidateRating_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateRating" ADD CONSTRAINT "CandidateRating_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardLayout" ADD CONSTRAINT "DashboardLayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedFilter" ADD CONSTRAINT "SavedFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
