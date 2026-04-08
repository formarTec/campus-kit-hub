-- Add value and in_use fields to computers table
ALTER TABLE public.computers ADD COLUMN value NUMERIC(12,2);
ALTER TABLE public.computers ADD COLUMN in_use BOOLEAN NOT NULL DEFAULT false;