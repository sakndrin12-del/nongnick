-- AlterTable
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill existing single cover image into images array
UPDATE "articles"
SET "images" = ARRAY["image"]
WHERE "image" IS NOT NULL AND cardinality("images") = 0;
