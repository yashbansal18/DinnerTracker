import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, UtensilsCrossed, Calendar, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import RepeatAlert from "@/components/repeat-alert";
import { format } from "date-fns";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  const { data: recentDishes, isLoading: dishesLoading } = useQuery({
    queryKey: ['/api/recently-served'],
    enabled: isAuthenticated,
  });

  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ['/api/guests'],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-32 rounded-xl mb-6" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const upcomingEvents = events?.filter(event => new Date(event.date) > new Date()).slice(0, 3) || [];
  const recentlyServed = recentDishes?.slice(0, 4) || [];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark">Second Helpings</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = '/api/logout'}
            className="w-10 h-10 bg-muted rounded-full"
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 pb-24">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/add-event')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 h-auto rounded-xl flex flex-col items-center gap-2 card-shadow"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Event</span>
          </Button>
          <Button 
            onClick={() => navigate('/guests')}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-4 h-auto rounded-xl flex flex-col items-center gap-2 card-shadow"
          >
            <Users className="w-6 h-6" />
            <span className="text-sm font-medium">Guests</span>
          </Button>
          <Button 
            onClick={() => navigate('/dishes')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground p-4 h-auto rounded-xl flex flex-col items-center gap-2 card-shadow"
          >
            <UtensilsCrossed className="w-6 h-6" />
            <span className="text-sm font-medium">Dishes</span>
          </Button>
        </div>

        {/* Repeat Dish Alert */}
        <RepeatAlert />

        {/* Upcoming Dinners */}
        <section>
          <h2 className="text-xl font-semibold text-dark mb-4">Upcoming Dinners</h2>
          {eventsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming dinners planned</p>
                <Button 
                  onClick={() => navigate('/add-event')}
                  className="mt-4"
                  variant="outline"
                >
                  Plan Your First Dinner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recently Served Dishes */}
        <section>
          <h2 className="text-xl font-semibold text-dark mb-4">Recently Served Dishes</h2>
          {dishesLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : recentlyServed.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-6 text-center">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dishes served yet</p>
                <Button 
                  onClick={() => navigate('/add-dish')}
                  className="mt-4"
                  variant="outline"
                >
                  Add Your First Dish
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recentlyServed.map((item) => (
                <Card 
                  key={item.dish.id} 
                  className="card-shadow cursor-pointer"
                  onClick={() => navigate(`/dishes/${item.dish.id}`)}
                >
                  <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                    {item.dish.imageUrl ? (
                      <img 
                        src={item.dish.imageUrl} 
                        alt={item.dish.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-dark text-sm truncate">{item.dish.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.lastServed ? format(new Date(item.lastServed), 'MMM dd, yyyy') : 'Never served'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
