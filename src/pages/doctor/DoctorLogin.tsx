import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Stethoscope, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rizivNumber, setRizivNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/doctor-dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        navigate('/doctor-dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has doctor role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'doctor')
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('U heeft geen toegang tot het doktersportaal');
      }

      toast({
        title: "Succesvol ingelogd",
        description: "Welkom terug!",
      });
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/doctor-dashboard`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registratie mislukt');

      // Add doctor role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'doctor' });

      if (roleError) throw roleError;

      // Create doctor profile
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          riziv_number: rizivNumber,
          email: email,
        });

      if (doctorError) throw doctorError;

      toast({
        title: "Account aangemaakt",
        description: "U kunt nu inloggen met uw gegevens",
      });
      
      setIsLogin(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 to-primary/5">
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
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Auralis</h1>
          </div>
        </div>

        <div className="mx-auto max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{isLogin ? 'Doktersportaal' : 'Registreren'}</CardTitle>
              <CardDescription>
                {isLogin ? 'Log in om toegang te krijgen tot uw consultaties' : 'Maak een account aan voor het doktersportaal'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <Label htmlFor="firstName">Voornaam</Label>
                      <Input
                        id="firstName"
                        type="text"
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
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="riziv">RIZIV-nummer</Label>
                      <Input
                        id="riziv"
                        type="text"
                        placeholder="00000000000"
                        value={rizivNumber}
                        onChange={(e) => setRizivNumber(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="dokter@voorbeeld.be"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Even geduld...' : (isLogin ? 'Inloggen' : 'Registreren')}
                </Button>
              </form>

              <div className="pt-4 text-center text-sm text-muted-foreground">
                {isLogin ? 'Nog geen account? ' : 'Al een account? '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? 'Registreer hier' : 'Log in'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Test credentials info */}
          <Card className="mt-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Test Account
                </h4>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> test@auralis.be<br />
                  <strong>Wachtwoord:</strong> test1234
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Voor zorgverleners</h4>
                <p className="text-muted-foreground">
                  Dit portaal is exclusief toegankelijk voor erkende zorgverleners. 
                  Toegang vereist een geldig RIZIV-nummer en verificatie.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
