-- Add columns required by the Better Auth admin plugin.
ALTER TABLE "user" ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "banReason" TEXT;
ALTER TABLE "user" ADD COLUMN "banExpires" TIMESTAMP(3);
ALTER TABLE "session" ADD COLUMN "impersonatedBy" TEXT;
