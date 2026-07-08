-- Persist admin feedback notes when requesting changes on a project
ALTER TABLE "projects" ADD COLUMN "adminFeedbackNotes" TEXT;
ALTER TABLE "projects" ADD COLUMN "adminFeedbackAt" TIMESTAMP(3);
