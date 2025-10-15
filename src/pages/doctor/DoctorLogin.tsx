import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login
    navigate('/doctor/dashboard');
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
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Mijn Gezond Verstand</h1>
          </div>
        </div>

        <div className="mx-auto max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Stethoscope className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Doktersportaal</CardTitle>
              <CardDescription>
                Log in om toegang te krijgen tot uw patiëntendossiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="riziv">RIZIV-nummer</Label>
                  <Input
                    id="riziv"
                    type="text"
                    placeholder="00000000000"
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
                  className="w-full bg-secondary hover:bg-secondary/90"
                  onClick={handleLogin}
                >
                  Inloggen
                </Button>
              </div>

              <div className="text-center text-sm">
                <button className="text-muted-foreground hover:text-foreground">
                  Wachtwoord vergeten?
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Of</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full"
              >
                Inloggen met eID
              </Button>

              <div className="pt-4 text-center text-sm text-muted-foreground">
                Nog geen account?{' '}
                <button className="font-semibold text-secondary hover:underline">
                  Vraag toegang aan
                </button>
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
