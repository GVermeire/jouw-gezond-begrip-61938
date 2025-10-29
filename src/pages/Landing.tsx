import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, Clock, FileText, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4 py-20 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <Mic className="h-4 w-4" />
              <span>AI-gestuurde medische transcriptie</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Auralis
            </h1>
            <p className="mb-10 text-xl text-white/90 sm:text-2xl">
              Intelligente transcriptie voor medische consultaties. 
              Automatische SOEP-notities die u direct kunt kopiëren naar uw EPD.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/doctor-login')}
              >
                Inloggen voor artsen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-foreground">Waarom Auralis?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Bespaar tijd met AI-gestuurde transcriptie en SOEP-notities
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Begrijpelijke Samenvattingen</CardTitle>
                <CardDescription>
                  Medische rapporten vertaald naar heldere, menselijke taal die iedereen begrijpt
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Veilig & Privé</CardTitle>
                <CardDescription>
                  Uw gezondheidsdata is beschermd volgens de strengste Belgische en Europese normen
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>SOEP Notaties</CardTitle>
                <CardDescription>
                  Automatisch gegenereerde SOEP-structuur klaar voor uw EPD-systeem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Mic className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Voor Dokters</CardTitle>
                <CardDescription>
                  Automatische transcriptie van consultaties bespaart u tijd en administratie
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tijdsbesparing</CardTitle>
                <CardDescription>
                  Minder administratie betekent meer tijd voor wat echt telt: de zorg
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-md transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Altijd Toegankelijk</CardTitle>
                <CardDescription>
                  Uw gezondheidsdata altijd binnen handbereik, wanneer u het nodig heeft
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-foreground">Hoe werkt het?</h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <h3 className="mb-6 text-center text-primary text-2xl">Zo werkt het</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">1</div>
                <div>
                  <h4 className="mb-1 font-semibold">Log in</h4>
                  <p className="text-muted-foreground">Meld u aan op het artsenportaal</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">2</div>
                <div>
                  <h4 className="mb-1 font-semibold">Start opname</h4>
                  <p className="text-muted-foreground">Begin met het opnemen van uw consultatie</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">3</div>
                <div>
                  <h4 className="mb-1 font-semibold">Ontvang SOEP notities</h4>
                  <p className="text-muted-foreground">Kopieer de automatisch gegenereerde SOEP-notities naar uw EPD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-12 text-center shadow-lg">
            <h2 className="mb-4 text-white">Klaar om te beginnen?</h2>
            <p className="mb-8 text-lg text-white/90">
              Start vandaag en ervaar de kracht van AI-transcriptie
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/doctor-login')}
            >
              Inloggen voor artsen
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <span className="font-semibold">Auralis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 - Intelligente medische transcriptie
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
