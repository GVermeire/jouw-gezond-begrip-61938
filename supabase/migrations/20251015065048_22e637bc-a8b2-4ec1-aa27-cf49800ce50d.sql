-- Fix 1: Add user_id column to doctors table for proper access control
ALTER TABLE public.doctors ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Fix 2: Replace overly permissive doctor viewing policy
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON public.doctors;

-- Doctors can view their own profile
CREATE POLICY "Doctors view own profile" ON public.doctors
FOR SELECT USING (auth.uid() = user_id);

-- Patients can only view their assigned GP
CREATE POLICY "Patients view assigned GP" ON public.doctors
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.gp_id = doctors.id
  )
);

-- Admins can view all doctors
CREATE POLICY "Admins view all doctors" ON public.doctors
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Replace overly permissive medication management policy
DROP POLICY IF EXISTS "Doctors can manage medication" ON public.medication_items;

-- Doctors can only create prescriptions for their own consultations
CREATE POLICY "Doctors create own prescriptions" ON public.medication_items
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.consultations
    WHERE consultations.id = medication_items.consultation_id
    AND consultations.doctor_id = auth.uid()
  )
);

-- Doctors can only update their own prescriptions
CREATE POLICY "Doctors update own prescriptions" ON public.medication_items
FOR UPDATE USING (
  has_role(auth.uid(), 'doctor'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.consultations
    WHERE consultations.id = medication_items.consultation_id
    AND consultations.doctor_id = auth.uid()
  )
);

-- Doctors can only delete their own prescriptions
CREATE POLICY "Doctors delete own prescriptions" ON public.medication_items
FOR DELETE USING (
  has_role(auth.uid(), 'doctor'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.consultations
    WHERE consultations.id = medication_items.consultation_id
    AND consultations.doctor_id = auth.uid()
  )
);