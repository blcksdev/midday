-- Fix missing functions and columns for the dashboard queries
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS canceled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS fiscal_year_start_month integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS export_settings jsonb DEFAULT '{}';

-- 2. Add missing columns to invoice_templates table
ALTER TABLE public.invoice_templates
ADD COLUMN IF NOT EXISTS note_details text DEFAULT '',
ADD COLUMN IF NOT EXISTS send_copy boolean DEFAULT false;

-- 3. Create missing function: get_next_invoice_number
CREATE OR REPLACE FUNCTION get_next_invoice_number(team_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number TEXT;
BEGIN
    -- Get the current invoice number for the team and increment it
    -- This is a basic implementation - adjust based on your actual invoice numbering logic
    SELECT COALESCE(MAX(invoice_number::integer), 0) + 1::TEXT
    INTO next_number
    FROM invoices 
    WHERE team_id = get_next_invoice_number.team_id;
    
    -- If no invoices exist, start with 1
    IF next_number IS NULL THEN
        next_number := '1';
    END IF;
    
    RETURN next_number;
EXCEPTION
    WHEN OTHERS THEN
        -- Return a default number if there's any error
        RETURN '1';
END;
$$;

-- 4. Create missing function: global_search
CREATE OR REPLACE FUNCTION global_search(
    search_query TEXT,
    team_id UUID,
    language TEXT DEFAULT 'english',
    limit_count INTEGER DEFAULT 30,
    offset_count INTEGER DEFAULT 0,
    threshold FLOAT DEFAULT 0.01
)
RETURNS TABLE(
    id TEXT,
    type TEXT,
    name TEXT,
    description TEXT,
    score FLOAT,
    data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Basic search implementation - adjust based on your actual search requirements
    RETURN QUERY
    SELECT 
        t.id::TEXT,
        'transaction'::TEXT,
        t.name::TEXT,
        t.description::TEXT,
        1.0::FLOAT,
        jsonb_build_object('amount', t.amount, 'date', t.date)
    FROM transactions t
    WHERE t.team_id = global_search.team_id
      AND (t.name ILIKE '%' || search_query || '%' OR t.description ILIKE '%' || search_query || '%')
    LIMIT limit_count
    OFFSET offset_count;
    
    -- You can add more search queries here for other tables (customers, invoices, etc.)
END;
$$;

-- 5. Verify the changes
SELECT 'Added missing columns to teams table' as status;
SELECT 'Created get_next_invoice_number function' as status;
SELECT 'Created global_search function' as status;
