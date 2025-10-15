import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Stethoscope, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Ongeldig e-mailadres").max(255, "E-mail te lang"),
  password: z.string().min(8, "Wachtwoord moet minstens 8 karakters bevatten").max(128, "Wachtwoord te lang"),
});

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Voornaam is verplicht").max(100, "Voornaam te lang").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Voornaam bevat ongeldige karakters"),
  lastName: z.string().trim().min(1, "Achternaam is verplicht").max(100, "Achternaam te lang").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Achternaam bevat ongeldige karakters"),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255, "E-mail te lang"),
  password: z.string()
    .min(8, "Wachtwoord moet minstens 8 karakters bevatten")
    .max(128, "Wachtwoord te lang")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Wachtwoord moet een kleine letter, hoofdletter en cijfer bevatten"),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';
  const { toast } = useToast();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = loginSchema.safeParse({
        email: loginEmail,
        password: loginPassword,
      });

      if (!validation.success) {
        const error = validation.error.errors[0];
        toast({
          title: "Validatiefout",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) throw error;

      if (data.user) {
        // Verify role
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('role', role as 'patient' | 'doctor')
            .maybeSingle();

        if (roles) {
          navigate(role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard');
        } else {
          toast({
            title: "Toegang geweigerd",
            description: `U heeft geen ${role === 'patient' ? 'patiënt' : 'dokter'} rechten.`,
            variant: "destructive",
          });
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      toast({
        title: "Login mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = registerSchema.safeParse({
        firstName,
        lastName,
        email: registerEmail,
        password: registerPassword,
      });

      if (!validation.success) {
        const error = validation.error.errors[0];
        toast({
          title: "Validatiefout",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: validation.data.firstName,
            last_name: validation.data.lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile with validated data
        await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: validation.data.firstName,
          last_name: validation.data.lastName,
        });

        // Assign role
        await supabase.from('user_roles').insert([{
          user_id: data.user.id,
          role: role as 'patient' | 'doctor',
        }]);

        toast({
          title: "Registratie geslaagd",
          description: "Uw account is aangemaakt. U wordt ingelogd...",
        });

        // Auto-login and redirect
        setTimeout(() => {
          navigate(role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard');
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPatient = role === 'patient';
  const Icon = isPatient ? User : Stethoscope;
  const title = isPatient ? 'Patiëntenportaal' : 'Doktersportaal';
  const subtitle = isPatient 
    ? 'Log in om toegang te krijgen tot uw gezondheidsdossier'
    : 'Log in om toegang te krijgen tot uw patiëntendossiers';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Terug naar home
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Mijn Gezond Verstand</h1>
          </div>
        </div>

        <div className="mx-auto max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isPatient ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                <Icon className={`h-8 w-8 ${isPatient ? 'text-primary' : 'text-secondary'}`} />
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Inloggen</TabsTrigger>
                  <TabsTrigger value="register">Aanmelden</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="uw.email@voorbeeld.be"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Wachtwoord</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Bezig met inloggen...' : 'Inloggen'}
                    </Button>
                  </form>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Nog geen account? Klik op "Aanmelden" hierboven
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">Voornaam</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Jan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Achternaam</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Peeters"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="uw.email@voorbeeld.be"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Wachtwoord</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Account aanmaken...' : 'Account aanmaken'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className={`mt-6 ${isPatient ? 'border-primary/50 bg-primary/5' : 'border-secondary/50 bg-secondary/5'}`}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className={isPatient ? 'text-primary' : 'text-secondary'}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Veilig & Privé</h4>
                  <p className="text-sm text-muted-foreground">
                    {isPatient 
                      ? 'Uw gezondheidsdata wordt beschermd volgens GDPR en Belgische wetgeving.'
                      : 'Dit portaal is exclusief toegankelijk voor erkende zorgverleners.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
