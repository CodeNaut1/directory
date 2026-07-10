-- CreateEnum
CREATE TYPE "EmailRecipientGroup" AS ENUM ('user', 'admin', 'sensitive', 'team');

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN "recipientGroup" "EmailRecipientGroup" NOT NULL DEFAULT 'team';

-- Backfill from template key conventions
UPDATE "email_templates" SET "recipientGroup" = 'user' WHERE "key" LIKE '%_user';
UPDATE "email_templates" SET "recipientGroup" = 'admin' WHERE "key" LIKE '%_admin';
