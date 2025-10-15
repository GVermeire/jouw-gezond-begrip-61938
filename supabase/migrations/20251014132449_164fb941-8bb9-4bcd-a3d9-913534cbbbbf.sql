-- Create enum types
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin', 'pharmacy_partner');
CREATE TYPE public.view_style AS ENUM ('simple', 'detailed', 'technical');
CREATE TYPE public.language_code AS ENUM ('nl', 'fr', 'en');
CREATE TYPE public.transcript_style AS ENUM ('short', 'standard', 'extended');
CREATE TYPE public.delivery_method AS ENUM ('pickup', 'home_delivery');
CREATE TYPE public.order_status AS ENUM ('sent_to_pharmacy', 'processing', 'ready', 'shipped', 'delivered');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Doctors (Huisarts) table - CREATE THIS FIRST
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  riziv_number TEXT,
  practice_name TEXT,
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Profiles table - NOW we can reference doctors
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  street TEXT,
  house_number TEXT,
  box TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'België',
  preferred_language language_code NOT NULL DEFAULT 'nl',
  view_style view_style NOT NULL DEFAULT 'simple',
  gp_id UUID REFERENCES public.doctors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  transcript TEXT,
  transcript_style transcript_style DEFAULT 'standard',
  summary_simple TEXT,
  summary_detailed TEXT,
  summary_technical TEXT,
  summary_nl JSONB,
  summary_fr JSONB,
  summary_en JSONB,
  doctor_notes TEXT,
  notes_private BOOLEAN DEFAULT false,
  diagnosis TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Medication items table
CREATE TABLE public.medication_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  quantity_suggested INTEGER DEFAULT 1,
  is_repeatable BOOLEAN DEFAULT false,
  pushed_to_patient BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medication_items ENABLE ROW LEVEL SECURITY;

-- Pharmacies table
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivery_method delivery_method NOT NULL,
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  delivery_street TEXT,
  delivery_house_number TEXT,
  delivery_box TEXT,
  delivery_postal_code TEXT,
  delivery_city TEXT,
  delivery_country TEXT,
  status order_status NOT NULL DEFAULT 'sent_to_pharmacy',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  medication_item_id UUID REFERENCES public.medication_items(id),
  name TEXT NOT NULL,
  dosage TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Consent records table
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role app_role,
  action TEXT NOT NULL,
  record_type TEXT,
  record_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- User roles: Users can view their own roles, admins can view all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can view/update own profile, doctors can view patient profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can view patient profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- Doctors: All authenticated users can view doctors
CREATE POLICY "Authenticated users can view doctors"
  ON public.doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Consultations: Patients can view their own, doctors can view and manage their consultations
CREATE POLICY "Patients can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can insert consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'doctor'));

-- Medication items: Linked to consultation access
CREATE POLICY "View medication via consultation"
  ON public.medication_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = medication_items.consultation_id
      AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Doctors can manage medication"
  ON public.medication_items FOR ALL
  USING (public.has_role(auth.uid(), 'doctor'));

-- Pharmacies: All authenticated users can view
CREATE POLICY "Authenticated users can view pharmacies"
  ON public.pharmacies FOR SELECT
  TO authenticated
  USING (true);

-- Orders: Patients can manage their own orders
CREATE POLICY "Patients can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = patient_id);

-- Order items: Linked to order access
CREATE POLICY "View order items via order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.patient_id = auth.uid()
    )
  );

CREATE POLICY "Create order items with order"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.patient_id = auth.uid()
    )
  );

-- Consent records: Users can manage their own consent
CREATE POLICY "Users can view own consent"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consent"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit logs: Only admins can view
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Insert mock data for doctors
INSERT INTO public.doctors (first_name, last_name, riziv_number, practice_name, street, house_number, postal_code, city, phone, email) VALUES
('Sarah', 'Janssens', '1-23456-78-901', 'Huisartsenpraktijk Janssens', 'Kerkstraat', '15', '2000', 'Antwerpen', '+32 3 123 45 67', 'sarah.janssens@praktijk.be'),
('Marc', 'Dubois', '1-23456-78-902', 'Medisch Centrum Dubois', 'Grote Markt', '8', '9000', 'Gent', '+32 9 234 56 78', 'marc.dubois@centrum.be'),
('Els', 'Vermeulen', '1-23456-78-903', 'Dokter Vermeulen', 'Dorpsplein', '23', '3000', 'Leuven', '+32 16 345 67 89', 'els.vermeulen@praktijk.be');

-- Insert mock data for pharmacies
INSERT INTO public.pharmacies (name, street, house_number, postal_code, city, phone, email, opening_hours) VALUES
('Apotheek Centrum', 'Meir', '45', '2000', 'Antwerpen', '+32 3 111 22 33', 'info@apotheekcentrum.be', '{"mon-fri": "8:00-18:30", "sat": "9:00-13:00", "sun": "closed"}'),
('Pharmacie Saint-Pierre', 'Rue Royale', '12', '1000', 'Brussel', '+32 2 222 33 44', 'contact@stpierre.be', '{"mon-fri": "8:30-19:00", "sat": "9:00-17:00", "sun": "10:00-12:00"}'),
('Apotheek Gezondheid', 'Bondgenotenlaan', '89', '3000', 'Leuven', '+32 16 333 44 55', 'info@gezondheid.be', '{"mon-fri": "8:00-18:00", "sat": "9:00-12:30", "sun": "closed"}');