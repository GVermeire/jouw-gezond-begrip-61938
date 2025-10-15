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
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          street: formData.street || null,
          house_number: formData.houseNumber || null,
          box: formData.box || null,
          postal_code: formData.postalCode || null,
          city: formData.city || null,
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
