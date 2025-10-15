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

    const { consultationId, audioPath } = await req.json();
    
    if (!consultationId || !audioPath) {
      throw new Error('consultationId and audioPath are required');
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
    formData.append('language', 'nl');

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
    console.log('Transcription complete, generating summaries');

    // Generate three different summary styles using GPT
    const summaryPromises = [
      generateSummary(rawTranscript, 'simple', OPENAI_API_KEY),
      generateSummary(rawTranscript, 'detailed', OPENAI_API_KEY),
      generateSummary(rawTranscript, 'technical', OPENAI_API_KEY)
    ];

    const [summarySimple, summaryDetailed, summaryTechnical] = await Promise.all(summaryPromises);

    console.log('Summaries generated, updating database');

    // Update consultation record
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        transcript: rawTranscript,
        summary_simple: summarySimple,
        summary_detailed: summaryDetailed,
        summary_technical: summaryTechnical,
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
        summaries: {
          simple: summarySimple,
          detailed: summaryDetailed,
          technical: summaryTechnical
        }
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

async function generateSummary(transcript: string, style: string, apiKey: string): Promise<string> {
  const prompts = {
    simple: `Maak een eenvoudige, begrijpelijke samenvatting van dit medisch consult in het Nederlands. Gebruik dagelijks taal zonder medisch jargon. Maximum 3 alinea's:\n\n${transcript}`,
    detailed: `Maak een gedetailleerde samenvatting van dit medisch consult in het Nederlands. Vermeld alle besproken klachten, onderzoeken, diagnoses en behandelplannen. Gebruik professionele maar begrijpelijke taal:\n\n${transcript}`,
    technical: `Maak een technische medische samenvatting van dit consult in het Nederlands. Gebruik correcte medische terminologie, SOEP-structuur (Subjectief, Objectief, Evaluatie, Plan) en vermeld alle relevante medische details:\n\n${transcript}`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Je bent een medische assistent die consulten samenvat in het Nederlands.' },
        { role: 'user', content: prompts[style as keyof typeof prompts] }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
