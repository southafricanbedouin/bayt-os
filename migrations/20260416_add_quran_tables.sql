-- Add Quran tracking tables for Hifz, Revision, and Exams

-- Add section column to quran_progress if it doesn't exist
ALTER TABLE quran_progress
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'recitation';

-- Hifz Memorization Progress
CREATE TABLE IF NOT EXISTS hifz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  surah INTEGER NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah_start INTEGER NOT NULL CHECK (ayah_start >= 1),
  ayah_end INTEGER NOT NULL CHECK (ayah_end >= ayah_start),
  status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'memorized', 'revision')),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  date_completed DATE,
  logged_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(member_id, surah, ayah_start, ayah_end)
);

-- Quran Revision Logs
CREATE TABLE IF NOT EXISTS quran_revision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  surah INTEGER NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah_start INTEGER NOT NULL CHECK (ayah_start >= 1),
  ayah_end INTEGER NOT NULL CHECK (ayah_end >= ayah_start),
  type TEXT CHECK (type IN ('solo', 'with_parent', 'with_shaikh')),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  logged_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Quran Exams
CREATE TABLE IF NOT EXISTS quran_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL,
  exam_date DATE NOT NULL,
  type TEXT CHECK (type IN ('self_test', 'parent_test', 'formal_exam')),
  surah INTEGER CHECK (surah IS NULL OR (surah >= 1 AND surah <= 114)),
  ayah_start INTEGER,
  ayah_end INTEGER,
  performance_rating INTEGER CHECK (performance_rating IS NULL OR (performance_rating >= 1 AND performance_rating <= 5)),
  errors_count INTEGER CHECK (errors_count IS NULL OR errors_count >= 0),
  fluency_rating INTEGER CHECK (fluency_rating IS NULL OR (fluency_rating >= 1 AND fluency_rating <= 5)),
  feedback_notes TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_hifz_progress_member_id ON hifz_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_hifz_progress_status ON hifz_progress(status);
CREATE INDEX IF NOT EXISTS idx_quran_revision_logs_member_id ON quran_revision_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_quran_revision_logs_logged_at ON quran_revision_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_quran_exams_member_id ON quran_exams(member_id);
CREATE INDEX IF NOT EXISTS idx_quran_exams_exam_date ON quran_exams(exam_date);

-- Enable RLS for new tables (assuming RLS is enabled on other tables)
ALTER TABLE hifz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_revision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_exams ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust based on your auth model)
-- Policy: Users can only see their own family's data
-- Assuming family_id is accessible via JWT claims

CREATE POLICY "hifz_progress_select" ON hifz_progress
  FOR SELECT
  USING (TRUE); -- Adjust based on your auth model

CREATE POLICY "hifz_progress_insert" ON hifz_progress
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "hifz_progress_update" ON hifz_progress
  FOR UPDATE
  USING (TRUE);

CREATE POLICY "hifz_progress_delete" ON hifz_progress
  FOR DELETE
  USING (TRUE);

CREATE POLICY "quran_revision_logs_select" ON quran_revision_logs
  FOR SELECT
  USING (TRUE);

CREATE POLICY "quran_revision_logs_insert" ON quran_revision_logs
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "quran_revision_logs_update" ON quran_revision_logs
  FOR UPDATE
  USING (TRUE);

CREATE POLICY "quran_revision_logs_delete" ON quran_revision_logs
  FOR DELETE
  USING (TRUE);

CREATE POLICY "quran_exams_select" ON quran_exams
  FOR SELECT
  USING (TRUE);

CREATE POLICY "quran_exams_insert" ON quran_exams
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "quran_exams_update" ON quran_exams
  FOR UPDATE
  USING (TRUE);

CREATE POLICY "quran_exams_delete" ON quran_exams
  FOR DELETE
  USING (TRUE);
