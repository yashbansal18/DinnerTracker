import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Users, UtensilsCrossed, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import { format } from "date-fns";

interface GuestProfileProps {
  params: {
    id: string;
  };
}

export default function GuestProfile({ params }: GuestProfileProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'meals' | 'preferences'>('meals');
  
  const guestId = parseInt(params.id);

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

  const { data: guest, isLoading: guestLoading } = useQuery({
    queryKey: ['/api/guests', guestId],
    enabled: isAuthenticated && !isNaN(guestId),
  });

  const { data: mealHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/guests', guestId, 'meal-history'],
    enabled: isAuthenticated && !isNaN(guestId),
  });

  if (isLoading || !isAuthenticated || guestLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="text-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-36 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Guest not found</h2>
          <Button onClick={() => navigate('/guests')} variant="outline">
            Back to Guests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/guests')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Guest Profile</h1>
          <Button variant="ghost" size="icon">
            <Edit className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-background p-6 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-dark">{guest.name}</h2>
        {guest.email && (
          <p className="text-muted-foreground">{guest.email}</p>
        )}
        <div className="flex justify-center space-x-2 mt-4">
          {guest.dietaryRestrictions?.map((restriction) => (
            <Badge key={restriction} className="bg-green-100 text-green-800">
              {restriction}
            </Badge>
          ))}
          {guest.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-background border-b">
        <div className="flex">
          <Button 
            variant="ghost"
            className={`flex-1 py-3 ${activeTab === 'meals' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('meals')}
          >
            Past Meals
          </Button>
          <Button 
            variant="ghost"
            className={`flex-1 py-3 ${activeTab === 'preferences' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pb-24">
        {activeTab === 'meals' ? (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : !mealHistory || mealHistory.length === 0 ? (
              <Card className="card-shadow">
                <CardContent className="p-6 text-center">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No meal history yet</p>
                </CardContent>
              </Card>
            ) : (
              mealHistory.map((meal) => (
                <Card key={`${meal.event.id}-${meal.dish.id}`} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {meal.dish.imageUrl ? (
                          <img 
                            src={meal.dish.imageUrl} 
                            alt={meal.dish.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark">{meal.dish.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meal.eventDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">{meal.event.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dietary Restrictions */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-dark mb-3">Dietary Restrictions</h3>
                {guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0 ? (
                  <div className="space-y-2">
                    {guest.dietaryRestrictions.map((restriction) => (
                      <div key={restriction} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{restriction}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No dietary restrictions specified</p>
                )}
              </CardContent>
            </Card>

            {/* Favorite Categories */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-dark mb-3">Favorite Categories</h3>
                {guest.favoriteCategories && guest.favoriteCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {guest.favoriteCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No favorite categories specified</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-dark mb-3">Notes</h3>
                <p className="text-muted-foreground text-sm">
                  {guest.notes || "No notes added yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
