import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function RepeatAlert() {
  const { isAuthenticated } = useAuth();

  const { data: guests } = useQuery({
    queryKey: ['/api/guests'],
    enabled: isAuthenticated,
  });

  const { data: dishes } = useQuery({
    queryKey: ['/api/dishes'],
    enabled: isAuthenticated,
  });

  const { data: repeatAlerts } = useQuery({
    queryKey: ['/api/repeat-dish-alerts'],
    enabled: isAuthenticated && guests && dishes,
    queryFn: async () => {
      if (!guests || !dishes) return [];
      
      const response = await fetch('/api/repeat-dish-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: guests.map(g => g.id),
          dishIds: dishes.map(d => d.id),
        }),
        credentials: 'include',
      });
      
      if (!response.ok) return [];
      return response.json();
    },
  });

  if (!repeatAlerts || repeatAlerts.length === 0) return null;

  // Show only the first alert to avoid overwhelming the user
  const alert = repeatAlerts[0];

  return (
    <Card className="bg-destructive/10 border-destructive/20 card-shadow alert-pulse">
      <CardContent className="p-4">
        <h3 className="font-semibold text-destructive mb-2 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Repeat Dish Alert
        </h3>
        <p className="text-destructive text-sm">
          You served {alert.dish.title} to {alert.guest.name} on{' '}
          {new Date(alert.lastServed).toLocaleDateString()}. Consider trying something new!
        </p>
        {repeatAlerts.length > 1 && (
          <p className="text-destructive text-xs mt-2">
            +{repeatAlerts.length - 1} more repeat dish{repeatAlerts.length > 2 ? 's' : ''} detected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
