-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('pending', 'approved', 'rejected', 'unpublished');

-- AlterTable: migrate projects.status from SubmissionStatus to ProjectStatus
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus" USING ("status"::text::"ProjectStatus");
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'pending';
