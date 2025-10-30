import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the authenticated user owns this consultation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized: Invalid token');
    }

    const { consultationId, audioPath } = await req.json();
    
    if (!consultationId || !audioPath) {
      throw new Error('consultationId and audioPath are required');
    }

    // Verify user is the doctor for this consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('doctor_id')
      .eq('id', consultationId)
      .single();

    if (consultationError || !consultation) {
      console.error('Consultation lookup error:', consultationError);
      throw new Error('Consultation not found');
    }

    if (consultation.doctor_id !== user.id) {
      console.error('Ownership mismatch:', { userId: user.id, doctorId: consultation.doctor_id });
      throw new Error('Unauthorized: You do not own this consultation');
    }

    console.log('Downloading audio from storage:', audioPath);
    
    // Download audio from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('consult-audio')
      .download(audioPath);

    if (downloadError) {
      console.error('Error downloading audio:', downloadError);
      throw downloadError;
    }

    console.log('Audio downloaded, sending to OpenAI for transcription');

    // Transcribe with OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('OpenAI transcription error:', errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const { text: rawTranscript } = await transcriptionResponse.json();
    console.log('Transcription complete, generating SOAP summary');

    // Generate SOAP format summary with SNOMED codes
    const soapSummary = await generateSoapSummary(rawTranscript, OPENAI_API_KEY);

    console.log('SOAP summary with SNOMED codes generated, updating database');

    // Update consultation record with SOAP summary
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        transcript: rawTranscript,
        summary_simple: soapSummary,
        summary_detailed: null,
        summary_technical: null,
      })
      .eq('id', consultationId);

    if (updateError) {
      console.error('Error updating consultation:', updateError);
      throw updateError;
    }

    console.log('Consultation updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        transcript: rawTranscript,
        soap_summary: soapSummary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-consultation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateSoapSummary(transcript: string, apiKey: string): Promise<string> {
  const prompt = `Create a structured summary of this consultation conversation in SOAP format (Subjective, Objective, Assessment, Plan).

Use this structure and add relevant SNOMED-CT codes:

S (Subjective):
- Complaints and symptoms as described by the patient
- Medical history

O (Objective):
- Physical examination
- Measurements (blood pressure, temperature, etc.)
- Observations

A (Assessment):
- Diagnosis or differential diagnosis
- Interpretation of findings
- SNOMED-CT codes for diagnoses

P (Plan):
- Treatment
- Medication (with SNOMED-CT codes if applicable)
- Follow-up appointments
- Advice

SNOMED-CT Codes:
List all relevant SNOMED-CT codes for:
- Diagnoses
- Procedures
- Findings
- Medication

Transcript:
${transcript}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a medical assistant that helps structure consultations according to the SOAP format in English. You also add relevant SNOMED-CT codes for diagnoses, procedures, and medication.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
