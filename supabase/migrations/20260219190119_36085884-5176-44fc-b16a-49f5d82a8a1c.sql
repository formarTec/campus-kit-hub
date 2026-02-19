
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'gestor', 'usuario');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Prédios (Buildings)
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read buildings" ON public.buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage buildings" ON public.buildings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- License groups
CREATE TABLE public.license_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.license_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read license_groups" ON public.license_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage license_groups" ON public.license_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Suppliers (Fornecedores)
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  contacts TEXT,
  address TEXT,
  contract_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Licenses
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  software_name TEXT NOT NULL,
  license_key TEXT,
  username TEXT,
  password TEXT,
  supplier_id UUID REFERENCES public.suppliers(id),
  group_id UUID REFERENCES public.license_groups(id),
  purchase_price NUMERIC(12,2),
  payment_type TEXT CHECK (payment_type IN ('mensal', 'anual', 'vitalicio')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read licenses" ON public.licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Computers
CREATE TABLE public.computers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building_id UUID REFERENCES public.buildings(id),
  location TEXT,
  hardware_specs TEXT,
  software_specs TEXT,
  ip_address TEXT,
  acquisition_type TEXT CHECK (acquisition_type IN ('doado', 'comprado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.computers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read computers" ON public.computers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage computers" ON public.computers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Computer licenses junction
CREATE TABLE public.computer_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_id UUID REFERENCES public.computers(id) ON DELETE CASCADE NOT NULL,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(computer_id, license_id)
);
ALTER TABLE public.computer_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read computer_licenses" ON public.computer_licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage computer_licenses" ON public.computer_licenses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Financial records
CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id),
  amount NUMERIC(12,2) NOT NULL,
  start_date DATE,
  grace_period_days INTEGER,
  due_day INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read financial_records" ON public.financial_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage financial_records" ON public.financial_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Maintenance records
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_id UUID REFERENCES public.computers(id),
  instrument_id UUID,
  last_maintenance DATE,
  next_maintenance DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read maintenance_records" ON public.maintenance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage maintenance_records" ON public.maintenance_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Musical instruments
CREATE TYPE public.instrument_type AS ENUM ('instrumento', 'microfone', 'caixa_de_som', 'mesa_de_som', 'outro');
CREATE TYPE public.instrument_status AS ENUM ('disponivel', 'em_uso', 'emprestado', 'manutencao');

CREATE TABLE public.instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  type instrument_type NOT NULL DEFAULT 'instrumento',
  serial_number TEXT,
  status instrument_status NOT NULL DEFAULT 'disponivel',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read instruments" ON public.instruments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage instruments" ON public.instruments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Instrument loans (empréstimos)
CREATE TABLE public.instrument_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID REFERENCES public.instruments(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  student_contact TEXT,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return DATE,
  actual_return DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.instrument_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read instrument_loans" ON public.instrument_loans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage instrument_loans" ON public.instrument_loans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gestor'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_computers_updated_at BEFORE UPDATE ON public.computers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instruments_updated_at BEFORE UPDATE ON public.instruments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
