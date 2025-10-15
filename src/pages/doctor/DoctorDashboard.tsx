import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Settings, LogOut, Mic, MicOff, Search, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<number | null>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [micConnected] = useState(true); // Mock - in production check actual mic status
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/doctor-login');
        return;
      }

      // Verify doctor role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'doctor')
        .single();

      if (!roles) {
        navigate('/doctor-login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/doctor-login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Mock patient data
  const patients = [
    {
      id: 0,
      name: "Jan Peeters",
      time: "09:00",
      notes: "Routine controle, bloeddruk meting...",
      date: "Vandaag",
    },
    {
      id: 1,
      name: "Marie Dubois",
      time: "09:30",
      notes: "Griepsymptomen, koorts sinds gisteren...",
      date: "Vandaag",
    },
    {
      id: 2,
      name: "Peter Janssens",
      time: "10:00",
      notes: "Follow-up diabetes type 2...",
      date: "Vandaag",
    },
    {
      id: 3,
      name: "Sophie Vermeulen",
      time: "14:00",
      notes: "Nieuwe patient, intake gesprek...",
      date: "Gisteren",
    },
  ];

  const currentPatient = patients.find(p => p.id === selectedPatient);

  const handleStartConsultation = () => {
    if (!micConnected) return;
    setIsRecording(!isRecording);
  };

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
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-secondary" />
              <span className="text-xl font-semibold">Doktersportaal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Dr. Sarah Janssens</span>
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Patient List */}
        <div className="w-80 border-r border-border bg-muted/30">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoek patiënt..."
                className="pl-9"
              />
            </div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Vandaag - 15 maart 2024</span>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={cn(
                  "w-full border-b border-border p-4 text-left transition-colors hover:bg-muted/50",
                  selectedPatient === patient.id && "bg-primary/5 border-l-4 border-l-primary"
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">{patient.time}</span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{patient.notes}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Section - Consultation */}
        <div className="flex flex-1 flex-col">
          {currentPatient ? (
            <>
              {/* Patient Header */}
              <div className="border-b border-border bg-card p-6">
                <h2 className="text-2xl font-semibold">{currentPatient.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Consultatie om {currentPatient.time}
                </p>
              </div>

              {/* Recording Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Button
                        size="lg"
                        className={cn(
                          "h-24 w-24 rounded-full",
                          isRecording 
                            ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                            : "bg-secondary hover:bg-secondary/90"
                        )}
                        onClick={handleStartConsultation}
                        disabled={!micConnected}
                      >
                        {isRecording ? (
                          <MicOff className="h-10 w-10" />
                        ) : (
                          <Mic className="h-10 w-10" />
                        )}
                      </Button>
                      <p className="mt-4 text-sm font-semibold">
                        {isRecording ? "Opname bezig..." : "Start consultatie"}
                      </p>
                      {!micConnected && (
                        <p className="mt-2 text-sm text-destructive">
                          Microfoon niet verbonden
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {isRecording && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold">Live Transcriptie</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          [00:15] Goedemorgen meneer Peeters, hoe gaat het met u vandaag?
                        </p>
                        <p className="text-muted-foreground">
                          [00:23] Patient geeft aan zich goed te voelen, geen nieuwe klachten...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isRecording && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold">Eerdere Notities</h3>
                      <div className="space-y-4 text-sm">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">10 januari 2024</span>
                            <span className="text-muted-foreground">09:00</span>
                          </div>
                          <p className="text-muted-foreground">
                            Routine controle. Bloeddruk: 120/80 mmHg. Hartslag: 72 bpm. 
                            Patient is in goede gezondheid. Geen bijzonderheden. 
                            Follow-up over 3 maanden.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Selecteer een patiënt om te beginnen
            </div>
          )}
        </div>

        {/* Right Sidebar - Patient Info */}
        {currentPatient && (
          <div className="w-80 border-l border-border bg-muted/30 p-6">
            <h3 className="mb-4 font-semibold">Patiëntinfo</h3>
            <Card className="mb-4">
              <CardContent className="p-4">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Geboortedatum</dt>
                    <dd className="font-medium">15/04/1975</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Rijksregisternummer</dt>
                    <dd className="font-medium">75.04.15-123.45</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ziekenfonds</dt>
                    <dd className="font-medium">CM</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <h4 className="mb-2 text-sm font-semibold">Recente Consultaties</h4>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-border p-3">
                <div className="font-medium">10 januari 2024</div>
                <div className="text-muted-foreground">Routine controle</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="font-medium">15 oktober 2023</div>
                <div className="text-muted-foreground">Griepvaccinatie</div>
              </div>
            </div>

            <Button variant="outline" className="mt-6 w-full">
              Volledig dossier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
