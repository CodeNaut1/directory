-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "project_claims" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "proofOfOwnership" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_claims_projectId_idx" ON "project_claims"("projectId");

-- CreateIndex
CREATE INDEX "project_claims_userId_idx" ON "project_claims"("userId");

-- CreateIndex
CREATE INDEX "project_claims_status_idx" ON "project_claims"("status");

-- CreateIndex
CREATE INDEX "project_claims_createdAt_idx" ON "project_claims"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "project_claims_projectId_userId_key" ON "project_claims"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "project_claims" ADD CONSTRAINT "project_claims_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_claims" ADD CONSTRAINT "project_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
