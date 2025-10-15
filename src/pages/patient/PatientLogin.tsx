import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, CreditCard, Smartphone, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const loginMethods = [
    {
      id: "eid",
      name: "eID",
      icon: CreditCard,
      description: "Log in met uw elektronische identiteitskaart",
    },
    {
      id: "itsme",
      name: "itsme®",
      icon: Smartphone,
      description: "Bevestig uw identiteit met itsme",
    },
    {
      id: "banking",
      name: "Bankgegevens",
      icon: KeyRound,
      description: "Veilig inloggen via uw bank",
    },
  ];

  const handleLogin = (method: string) => {
    setSelectedMethod(method);
    // Mock login - in production this would redirect to actual auth providers
    setTimeout(() => {
      navigate('/patient/dashboard');
    }, 1500);
  };

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

        <div className="mx-auto max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welkom terug</CardTitle>
              <CardDescription>
                Kies uw inlogmethode om toegang te krijgen tot uw gezondheidsdossier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleLogin(method.id)}
                    disabled={selectedMethod === method.id}
                    className="w-full rounded-lg border border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="text-sm text-primary">Bezig met inloggen...</div>
                      )}
                    </div>
                  </button>
                );
              })}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Of</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="uw.email@voorbeeld.be"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  Inloggen met email
                </Button>
              </div>

              <div className="pt-4 text-center text-sm text-muted-foreground">
                Nog geen account?{' '}
                <button
                  onClick={() => navigate('/patient/register')}
                  className="font-semibold text-primary hover:underline"
                >
                  Registreer hier
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-secondary/50 bg-secondary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-secondary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Veilig & Privé</h4>
                  <p className="text-sm text-muted-foreground">
                    Uw gezondheidsdata wordt beschermd volgens GDPR en Belgische wetgeving. 
                    We delen nooit uw gegevens zonder uw expliciete toestemming.
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

export default PatientLogin;
