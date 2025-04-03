CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  architect TEXT,
  year INTEGER,
  location TEXT,
  typology TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  images JSONB,
  characteristics JSONB,
  metadata JSONB,
  embedding JSONB,
  relevance_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_studies_typology ON case_studies(typology);
CREATE INDEX IF NOT EXISTS idx_case_studies_location ON case_studies(location);
CREATE INDEX IF NOT EXISTS idx_case_studies_year ON case_studies(year);
CREATE INDEX IF NOT EXISTS idx_case_studies_relevance ON case_studies(relevance_score); 