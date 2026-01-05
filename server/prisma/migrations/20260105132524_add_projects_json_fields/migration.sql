/*
  Warnings:

  - You are about to drop the `project_details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_details" DROP CONSTRAINT "project_details_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_countryId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_userId_fkey";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "acceptsGiftCards" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsLightning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsOnchain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "countryName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "foundedYear" TEXT,
ADD COLUMN     "founderEmail" TEXT,
ADD COLUMN     "founderName" TEXT,
ADD COLUMN     "founderTwitter" TEXT,
ADD COLUMN     "impact" TEXT,
ADD COLUMN     "initiatives" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "countryId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "project_details";

-- CreateIndex
CREATE INDEX "projects_active_idx" ON "projects"("active");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_countryCode_idx" ON "projects"("countryCode");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
