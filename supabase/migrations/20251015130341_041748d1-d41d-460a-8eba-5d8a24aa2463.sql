-- Fix overly permissive RLS policies on consultations table
-- Drop the policy that allows ANY doctor to view ALL consultations
DROP POLICY IF EXISTS "Doctors can view their consultations" ON consultations;

-- Create restrictive policy: doctors can only view consultations where they are assigned
CREATE POLICY "Doctors view assigned consultations only"
ON consultations FOR SELECT TO authenticated
USING (auth.uid() = doctor_id);

-- Create policy for doctors to insert only their own consultations
CREATE POLICY "Doctors create own consultations"
ON consultations FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) AND auth.uid() = doctor_id);

-- Create policy for doctors to update only their assigned consultations
CREATE POLICY "Doctors update assigned consultations"
ON consultations FOR UPDATE TO authenticated
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);