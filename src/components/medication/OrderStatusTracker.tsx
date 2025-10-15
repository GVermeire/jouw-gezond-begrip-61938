import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, Package, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

interface OrderStatusTrackerProps {
  status: string;
  orderId: string;
}

const OrderStatusTracker = ({ status, orderId }: OrderStatusTrackerProps) => {
  const { language } = useLanguage();
  
  const statuses = [
    { key: 'sent_to_pharmacy', icon: Clock, label: t('medication.status.sent_to_pharmacy', language) },
    { key: 'processing', icon: Package, label: t('medication.status.processing', language) },
    { key: 'ready', icon: Check, label: t('medication.status.ready', language) },
    { key: 'shipped', icon: Truck, label: t('medication.status.shipped', language) },
    { key: 'delivered', icon: Check, label: t('medication.status.delivered', language) },
  ];
  
  const currentIndex = statuses.findIndex(s => s.key === status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('medication.orderStatus', language)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((s, index) => {
            const Icon = s.icon;
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTracker;
