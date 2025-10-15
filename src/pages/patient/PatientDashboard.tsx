import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Calendar, FileText, Settings, LogOut, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type ViewMode = "simple" | "detailed" | "technical";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/patient-login');
        return;
      }

      // Verify patient role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'patient')
        .single();

      if (!roles) {
        navigate('/patient-login');
        return;
      }

      setUser(session.user);
      
      // Load consultations
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', session.user.id)
        .eq('published_for_patient', true)
        .order('consultation_date', { ascending: false });
      
      if (consultationsData) {
        setConsultations(consultationsData);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/patient-login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Mock data
  const lastConsultation = {
    date: "15 maart 2024",
    doctor: "Dr. Sarah Janssens",
    specialty: "Huisarts",
    diagnosis: "Routine controle",
  };

  const getConsultationSummary = (mode: ViewMode) => {
    switch (mode) {
      case "simple":
        return {
          title: "Eenvoudige Uitleg",
          content: "U bent langsgekomen voor een routine controle. Alles ziet er goed uit. Uw bloeddruk is normaal en u bent gezond. De dokter raadt aan om te blijven bewegen en gezond te eten. Volgend jaar komt u terug voor een nieuwe controle.",
        };
      case "detailed":
        return {
          title: "Gedetailleerde Uitleg",
          content: "U had een afspraak voor uw jaarlijkse gezondheidscontrole. Tijdens het consult werden verschillende parameters gemeten: uw bloeddruk (120/80 mmHg), hartslag (72 bpm) en gewicht (75kg) zijn allemaal binnen de normale waarden. Uw arts heeft uw hart en longen beluisterd en alles klonk normaal. Er werden geen afwijkingen vastgesteld. De dokter beveelt aan om uw huidige levensstijl voort te zetten met regelmatige beweging (minstens 30 minuten per dag) en een gevarieerd voedingspatroon. Een nieuwe controle is gepland voor over 12 maanden.",
        };
      case "technical":
        return {
          title: "Technische Details",
          content: "Anamnese: Patiënt presenteert zich voor jaarlijkse preventieve screening. Geen actuele klachten. \n\nObjectief onderzoek: \n- Bloeddruk: 120/80 mmHg (normotensief)\n- Hartfrequentie: 72 bpm, regulair ritme\n- BMI: 24.5 (normaal gewicht)\n- Auscultatie cor: geen afwijkingen, geen souffle\n- Auscultatie pulmo: vesiculair ademgeruis, geen crepitaties\n\nConclusie: Goede algemene gezondheidstoestand. Geen pathologische bevindingen.\n\nBeleid: Continueren huidige levensstijl. Cardiovasculaire primaire preventie: aanbeveling 150min matige fysieke activiteit/week, mediterraan dieet. Controle over 12 maanden.",
        };
    }
  };

  const summary = getConsultationSummary(viewMode);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Mijn Gezond Verstand</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Welkom, Jan Peeters</h1>
          <p className="text-muted-foreground">
            Hier vindt u een overzicht van uw gezondheidsgegevens
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Mijn Consultaties</CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <p className="text-muted-foreground">
                    U heeft nog geen gepubliceerde consultaties.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {consultations.map((consult) => (
                      <Card key={consult.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Consultatie van {new Date(consult.consultation_date).toLocaleDateString('nl-NL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="simple" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="simple">Eenvoudig</TabsTrigger>
                              <TabsTrigger value="detailed">Gedetailleerd</TabsTrigger>
                              <TabsTrigger value="technical">Technisch</TabsTrigger>
                            </TabsList>
                            <TabsContent value="simple" className="mt-4">
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{consult.summary_simple || 'Geen eenvoudige samenvatting beschikbaar.'}</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="detailed" className="mt-4">
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{consult.summary_detailed || 'Geen gedetailleerde samenvatting beschikbaar.'}</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="technical" className="mt-4">
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{consult.summary_technical || 'Geen technische samenvatting beschikbaar.'}</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                          {consult.transcript && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                Bekijk volledige transcriptie
                              </summary>
                              <div className="mt-2 rounded-md bg-muted p-4">
                                <p className="text-sm whitespace-pre-wrap">{consult.transcript}</p>
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Last Consultation (old mock data - can be removed) */}
            <Card className="hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Laatste Consultatie</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                      <Calendar className="h-4 w-4" />
                      {lastConsultation.date}
                    </CardDescription>
                  </div>
                  <Select
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Eenvoudig</SelectItem>
                      <SelectItem value="detailed">Gedetailleerd</SelectItem>
                      <SelectItem value="technical">Technisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="font-semibold">{lastConsultation.doctor}</div>
                    <div className="text-sm text-muted-foreground">
                      {lastConsultation.specialty}
                    </div>
                  </div>
                  <div className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                    {lastConsultation.diagnosis}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-6">
                  <h3 className="mb-3 font-semibold">{summary.title}</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {summary.content}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download rapport
                  </Button>
                  <Button className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Volledige details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recente Activiteit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "15 maart 2024", type: "Consultatie", doctor: "Dr. Janssens" },
                    { date: "12 februari 2024", type: "Bloedonderzoek", doctor: "Lab AZ Sint-Jan" },
                    { date: "10 januari 2024", type: "Consultatie", doctor: "Dr. Janssens" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-muted-foreground">{item.doctor}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overzicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Totaal consultaties</span>
                  <span className="text-2xl font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dit jaar</span>
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Openstaande rapporten</span>
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-secondary/50 bg-secondary/5">
              <CardHeader>
                <CardTitle className="text-lg">Privacy & Toestemming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  U heeft toegang gegeven tot uw gezondheidsdata van:
                </p>
                <ul className="mb-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    mijngezondheid.belgie.be
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    Helena Care
                  </li>
                </ul>
                <Button variant="outline" className="w-full" size="sm">
                  Beheer toestemmingen
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hulp nodig?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Heeft u vragen over uw gezondheidsinformatie?
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  Contact support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
