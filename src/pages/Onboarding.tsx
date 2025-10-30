import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Language } from '@/lib/i18n';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('nl');
  const [viewStyle, setViewStyle] = useState<'simple' | 'detailed' | 'technical'>('simple');

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/patient-login');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_language: language,
          view_style: viewStyle,
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Preferences Saved',
        description: 'You will be redirected to your dashboard',
      });
      
      navigate('/patient-dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Welcome to My Healthy Mind</CardTitle>
          </div>
          <CardDescription>
            Let's set up your preferences for a personalized experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preferred Language</Label>
            <RadioGroup value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nl" id="nl" />
                <Label htmlFor="nl" className="cursor-pointer">Nederlands</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fr" id="fr" />
                <Label htmlFor="fr" className="cursor-pointer">Français</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="cursor-pointer">English (coming soon)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">Display Style</Label>
            <p className="text-sm text-muted-foreground">
              How would you like your medical information presented?
            </p>
            
            <RadioGroup value={viewStyle} onValueChange={(v) => setViewStyle(v as any)}>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="cursor-pointer font-medium">Simple</Label>
                </div>
                <p className="ml-6 text-sm text-muted-foreground">
                  Clear explanations without medical jargon
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="cursor-pointer font-medium">Detailed</Label>
                </div>
                <p className="ml-6 text-sm text-muted-foreground">
                  More context and details about your health
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical" className="cursor-pointer font-medium">Technical</Label>
                </div>
                <p className="ml-6 text-sm text-uted-foreground">
                  Full medical terminology and details
                </p>
              </div>
            </RadioGroup>
          </div>
          
          <Button onClick={handleComplete} className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
