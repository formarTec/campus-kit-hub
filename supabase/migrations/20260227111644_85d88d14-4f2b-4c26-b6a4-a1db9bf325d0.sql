
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instrument TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated can read students"
ON public.students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage students"
ON public.students FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update instrument_loans to reference students
ALTER TABLE public.instrument_loans ADD COLUMN student_id UUID REFERENCES public.students(id);
