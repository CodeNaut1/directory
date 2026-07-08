-- Add changes_requested status for admin feedback flow (distinct from hard rejection)
ALTER TYPE "ProjectStatus" ADD VALUE 'changes_requested';
