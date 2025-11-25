-- ============================================
-- FIX MISSING COLUMN
-- ============================================
-- Add the missing timezone_auto_sync column
-- ============================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS timezone_auto_sync boolean DEFAULT true;

-- Verify it was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'timezone_auto_sync';
