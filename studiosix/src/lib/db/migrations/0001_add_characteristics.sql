ALTER TABLE "case_studies"
ADD COLUMN IF NOT EXISTS "characteristics" jsonb,
ADD COLUMN IF NOT EXISTS "embedding" jsonb;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS "case_studies_characteristics_idx" ON "case_studies" USING gin ("characteristics");
CREATE INDEX IF NOT EXISTS "case_studies_embedding_idx" ON "case_studies" USING gin ("embedding"); 