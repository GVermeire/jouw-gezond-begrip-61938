-- Create storage buckets for consultation audio and transcripts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('consult-audio', 'consult-audio', false, 52428800, ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg']),
  ('consult-transcripts', 'consult-transcripts', false, 10485760, ARRAY['application/json', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for consult-audio bucket
CREATE POLICY "Doctors can upload consultation audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'consult-audio' AND
  has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors can view own consultation audio"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'consult-audio' AND
  has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors can delete own consultation audio"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'consult-audio' AND
  has_role(auth.uid(), 'doctor'::app_role)
);

-- Storage policies for consult-transcripts bucket
CREATE POLICY "Doctors can upload transcripts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'consult-transcripts' AND
  has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors and patients can view transcripts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'consult-transcripts' AND
  (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'patient'::app_role))
);

-- Add published_for_patient column to existing consultations table
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS published_for_patient boolean DEFAULT false;

-- Update RLS policy for patients to only see published consultations
DROP POLICY IF EXISTS "Patients can view own consultations" ON public.consultations;

CREATE POLICY "Patients can view published consultations"
ON public.consultations FOR SELECT TO authenticated
USING (
  auth.uid() = patient_id AND published_for_patient = true
);