-- Add 2FA fields to licenses table
ALTER TABLE public.licenses 
ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN two_factor_method TEXT;

-- Add license_id field to financial_records table to track which license the payment is for
ALTER TABLE public.financial_records 
ADD COLUMN license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_records_license_id ON public.financial_records(license_id);
