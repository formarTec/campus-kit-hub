
-- Classes (Aulas) table
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  day_of_week integer, -- 0=Sunday, 1=Monday, etc.
  start_time time,
  end_time time,
  instructor text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Authenticated can read classes" ON public.classes
  FOR SELECT TO authenticated
  USING (true);

-- Attendance records table
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'presente', -- presente, ausente, justificado
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id, date)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance_records" ON public.attendance_records
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Authenticated can read attendance_records" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (true);

-- Class-student enrollment table
CREATE TABLE public.class_students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage class_students" ON public.class_students
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Authenticated can read class_students" ON public.class_students
  FOR SELECT TO authenticated
  USING (true);
