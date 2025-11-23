-- Add title column to journals table
ALTER TABLE public.journals 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add index for title search
CREATE INDEX IF NOT EXISTS idx_journals_title ON public.journals(title);
