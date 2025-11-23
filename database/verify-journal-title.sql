-- Verify that title column exists in journals table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'journals'
  AND column_name = 'title';

-- Check if title index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'journals'
  AND indexname = 'idx_journals_title';

