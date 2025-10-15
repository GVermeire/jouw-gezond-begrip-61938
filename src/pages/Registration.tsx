import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, CreditCard, IdCard, Building2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { z } from 'zod';

const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "Voornaam is verplicht").max(100, "Voornaam te lang").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Voornaam bevat ongeldige karakters"),
  lastName: z.string().trim().min(1, "Achternaam is verplicht").max(100, "Achternaam te lang").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Achternaam bevat ongeldige karakters"),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255, "E-mail te lang"),
  password: z.string()
    .min(8, "Wachtwoord moet minstens 8 karakters bevatten")
    .max(128, "Wachtwoord te lang")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Wachtwoord moet een kleine letter, hoofdletter en cijfer bevatten"),
  phone: z.string().regex(/^(\+|00)?[0-9]{9,15}$/, "Ongeldig telefoonnummer").optional().or(z.literal('')),
  street: z.string().max(200, "Straatnaam te lang").optional().or(z.literal('')),
  houseNumber: z.string().max(10, "Huisnummer te lang").optional().or(z.literal('')),
  box: z.string().max(10, "Busnummer te lang").optional().or(z.literal('')),
  postalCode: z.string().regex(/^[0-9]{4}$/, "Ongeldige postcode").optional().or(z.literal('')),
  city: z.string().max(100, "Gemeente te lang").optional().or(z.literal('')),
});

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedGP, setSelectedGP] = useState<any>(null);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    houseNumber: '',
    box: '',
    postalCode: '',
    city: '',
    dataConsent: false,
    privacyConsent: false,
  });

  const searchDoctors = async (query: string) => {
    if (query.length < 2) return;
    
    // Sanitize input to prevent SQL injection - remove special SQL characters
    const sanitizedQuery = query.replace(/[%_]/g, '');
    
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .or(`first_name.ilike.%${sanitizedQuery}%,last_name.ilike.%${sanitizedQuery}%,practice_name.ilike.%${sanitizedQuery}%`)
      .limit(10);
    
    if (data) setDoctors(data);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataConsent || !formData.privacyConsent) {
      toast({
        title: 'Toestemming vereist',
        description: 'U moet akkoord gaan met beide toestemmingen om door te gaan.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate input
      const validation = registrationSchema.safeParse(formData);

      if (!validation.success) {
        const error = validation.error.errors[0];
        toast({
          title: 'Validatiefout',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Sign up user with validated data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create profile with validated data
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          first_name: validation.data.firstName,
          last_name: validation.data.lastName,
          phone: validation.data.phone || null,
          street: validation.data.street || null,
          house_number: validation.data.houseNumber || null,
          box: validation.data.box || null,
          postal_code: validation.data.postalCode || null,
          city: validation.data.city || null,
          gp_id: selectedGP?.id || null,
        });
        
        if (profileError) throw profileError;
        
        // Assign patient role
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'patient',
        });
        
        if (roleError) throw roleError;
        
        // Store consent records
        await supabase.from('consent_records').insert([
          {
            user_id: authData.user.id,
            consent_type: 'data_linking',
            consent_text: 'Expliciete toestemming om gezondheidsdata te koppelen',
            given: formData.dataConsent,
          },
          {
            user_id: authData.user.id,
            consent_type: 'privacy_policy',
            consent_text: 'Akkoord met privacyverklaring en gebruiksvoorwaarden',
            given: formData.privacyConsent,
          },
        ]);
        
        toast({
          title: 'Registratie geslaagd!',
          description: 'Welkom bij Mijn Gezond Verstand',
        });
        
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast({
        title: 'Registratie mislukt',
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
            <CardTitle className="text-2xl">Aanmelden</CardTitle>
          </div>
          <CardDescription>
            Maak uw account aan om toegang te krijgen tot uw gezondheidsgegevens
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Voornaam *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Achternaam *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord *</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">GSM (optioneel)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Straat</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Nr</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="box">Bus</Label>
                <Input
                  id="box"
                  value={formData.box}
                  onChange={(e) => setFormData({ ...formData, box: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postcode</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Gemeente</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Koppel je huisarts (optioneel)</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedGP ? `${selectedGP.first_name} ${selectedGP.last_name}` : 'Selecteer huisarts...'}
                    <Search className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Zoek huisarts..."
                      onValueChange={searchDoctors}
                    />
                    <CommandEmpty>Geen huisarts gevonden.</CommandEmpty>
                    <CommandGroup>
                      {doctors.map((doctor) => (
                        <CommandItem
                          key={doctor.id}
                          value={doctor.id}
                          onSelect={() => {
                            setSelectedGP(doctor);
                            setOpen(false);
                          }}
                        >
                          <div>
                            <div className="font-medium">
                              {doctor.first_name} {doctor.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {doctor.practice_name} - {doctor.city}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="itsme"
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="itsme" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Aanmelden via itsme® (Demo/placeholder)
                    </div>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="eid"
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="eid" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Aanmelden via eID (Demo/placeholder)
                    </div>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="bank"
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="bank" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Aanmelden via bankgegevens (Demo/placeholder)
                    </div>
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 rounded-lg border border-secondary/50 bg-secondary/5 p-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataConsent"
                  checked={formData.dataConsent}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, dataConsent: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label htmlFor="dataConsent" className="cursor-pointer text-sm">
                  Ik geef expliciete toestemming om mijn gezondheidsdata te koppelen *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacyConsent"
                  checked={formData.privacyConsent}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, privacyConsent: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label htmlFor="privacyConsent" className="cursor-pointer text-sm">
                  Ik ga akkoord met de privacyverklaring en gebruiksvoorwaarden *
                </Label>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Aanmelden...' : 'Account aanmaken'}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Heb je al een account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0"
                onClick={() => navigate('/patient-login')}
              >
                Inloggen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
