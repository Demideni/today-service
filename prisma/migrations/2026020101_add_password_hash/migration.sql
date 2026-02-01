-- Add optional passwordHash column to User for email/password auth.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
