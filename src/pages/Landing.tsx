import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, FileText, Code, RefreshCw } from "lucide-react";
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

      {/* How Auralis Works - 4 Steps */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-foreground">Hoe Auralis werkt</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Vier eenvoudige stappen van consultatie naar EPD-klaar verslag
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-border/50 shadow-lg transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">1. Auralis luistert en noteert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Auralis luistert mee tijdens de consultatie en vat het gesprek automatisch samen met behulp van AI. Uw eigen stijl en structuur blijven behouden — u hoeft niets meer zelf te noteren.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/80">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">2. Auralis schrijft</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Auralis genereert volledige consultatieverslagen, hospitalisatieverslagen, verwijsbrieven en attesten op basis van een korte dictee of opname.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">3. Auralis codeert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Auralis analyseert het verslag en haalt automatisch relevante SNOMED-CT-codes of medische trefwoorden uit de tekst.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/80">
                    <RefreshCw className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">4. Auralis herstructureert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Auralis zet elk verslag automatisch om in een duidelijke SOEP-structuur, klaar om te kopiëren naar het EPD-systeem.
                  </p>
                </CardContent>
              </Card>
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
