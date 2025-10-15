import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Pill } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  quantity_suggested: number;
}

interface Pharmacy {
  id: string;
  name: string;
  street: string;
  house_number: string;
  city: string;
}

interface MedicationOrderFlowProps {
  medications: MedicationItem[];
  onClose: () => void;
}

const MedicationOrderFlow = ({ medications, onClose }: MedicationOrderFlowProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(medications.map(m => [m.id, m.quantity_suggested]))
  );
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'home_delivery'>('pickup');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  // Load pharmacies
  useState(() => {
    const loadPharmacies = async () => {
      const { data } = await supabase.from('pharmacies').select('*').limit(10);
      if (data) setPharmacies(data);
    };
    loadPharmacies();
  });

  const toggleMed = (id: string) => {
    const newSet = new Set(selectedMeds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMeds(newSet);
  };

  const handlePlaceOrder = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) return;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          patient_id: profile.id,
          delivery_method: deliveryMethod,
          pharmacy_id: deliveryMethod === 'pickup' ? selectedPharmacy?.id : null,
          delivery_street: deliveryMethod === 'home_delivery' ? profile.street : null,
          delivery_house_number: deliveryMethod === 'home_delivery' ? profile.house_number : null,
          delivery_box: deliveryMethod === 'home_delivery' ? profile.box : null,
          delivery_postal_code: deliveryMethod === 'home_delivery' ? profile.postal_code : null,
          delivery_city: deliveryMethod === 'home_delivery' ? profile.city : null,
          delivery_country: deliveryMethod === 'home_delivery' ? profile.country : null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = Array.from(selectedMeds).map(medId => {
        const med = medications.find(m => m.id === medId)!;
        return {
          order_id: order.id,
          medication_item_id: med.id,
          name: med.name,
          dosage: med.dosage,
          quantity: quantities[medId],
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: t('medication.placeOrder', language),
        description: 'Uw bestelling is succesvol geplaatst',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          {t('medication.title', language)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Select Medication */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t('medication.selectItems', language)}</h3>
            {medications.length === 0 ? (
              <p className="text-muted-foreground">Geen medicatie beschikbaar om te bestellen.</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Checkbox
                      checked={selectedMeds.has(med.id)}
                      onCheckedChange={() => toggleMed(med.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">{t('medication.quantity', language)}:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[med.id]}
                          onChange={(e) => setQuantities({ 
                            ...quantities, 
                            [med.id]: parseInt(e.target.value) || 1 
                          })}
                          className="w-20"
                          disabled={!selectedMeds.has(med.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Delivery Method */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t('medication.delivery', language)}</h3>
            <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="pickup" className="cursor-pointer font-medium">
                      {t('medication.pickup', language)}
                    </Label>
                    {deliveryMethod === 'pickup' && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm">{t('medication.selectPharmacy', language)}</Label>
                        {pharmacies.map((pharmacy) => (
                          <div
                            key={pharmacy.id}
                            onClick={() => setSelectedPharmacy(pharmacy)}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedPharmacy?.id === pharmacy.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="font-medium">{pharmacy.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {pharmacy.street} {pharmacy.house_number}, {pharmacy.city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="home_delivery" id="home" className="mt-1" />
                  <Label htmlFor="home" className="cursor-pointer font-medium">
                    {t('medication.homeDelivery', language)}
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t('medication.summary', language)}</h3>
            
            <div className="space-y-3">
              {Array.from(selectedMeds).map(medId => {
                const med = medications.find(m => m.id === medId)!;
                return (
                  <div key={medId} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{med.name}</div>
                      <div className="text-muted-foreground">{med.dosage}</div>
                    </div>
                    <div className="font-medium">{quantities[medId]}x</div>
                  </div>
                );
              })}
            </div>
            
            <Separator />
            
            <div className="text-sm">
              <div className="font-medium mb-1">{t('medication.delivery', language)}:</div>
              {deliveryMethod === 'pickup' && selectedPharmacy && (
                <div className="text-muted-foreground">
                  {t('medication.pickup', language)} - {selectedPharmacy.name}
                </div>
              )}
              {deliveryMethod === 'home_delivery' && (
                <div className="text-muted-foreground">{t('medication.homeDelivery', language)}</div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Terug
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Annuleren
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && selectedMeds.size === 0}
            >
              Volgende
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handlePlaceOrder}>
              {t('medication.placeOrder', language)}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationOrderFlow;
