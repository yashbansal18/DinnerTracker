import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, UtensilsCrossed, Heart, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";

interface DishDetailProps {
  params: {
    id: string;
  };
}

export default function DishDetail({ params }: DishDetailProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const dishId = parseInt(params.id);

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

  const { data: dish, isLoading: dishLoading } = useQuery({
    queryKey: ['/api/dishes', dishId],
    enabled: isAuthenticated && !isNaN(dishId),
  });

  const { data: dishHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/dishes', dishId, 'history'],
    enabled: isAuthenticated && !isNaN(dishId),
  });

  if (isLoading || !isAuthenticated || dishLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6 text-center">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Dish not found</h2>
          <Button onClick={() => navigate('/dishes')} variant="outline">
            Back to Dishes
          </Button>
        </div>
      </div>
    );
  }

  const totalServed = dishHistory?.length || 0;
  const uniqueGuests = new Set(dishHistory?.flatMap(event => event.guests) || []).size;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dishes')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Dish Details</h1>
          <Button variant="ghost" size="icon">
            <Edit className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </header>

      {/* Dish Image */}
      <div className="relative">
        <div className="aspect-video bg-muted overflow-hidden">
          {dish.imageUrl ? (
            <img 
              src={dish.imageUrl} 
              alt={dish.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-background rounded-full p-2">
          <Heart className="w-5 h-5 text-destructive" />
        </div>
      </div>

      {/* Dish Info */}
      <div className="p-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-dark">{dish.title}</h2>
          <div className="flex items-center space-x-2">
            {dish.category && (
              <Badge variant="secondary">{dish.category}</Badge>
            )}
            {dish.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalServed}</div>
            <div className="text-sm text-muted-foreground">Times Served</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{uniqueGuests}</div>
            <div className="text-sm text-muted-foreground">Guests Served</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {dish.prepTime || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">
              {dish.prepTime ? 'Prep Time' : 'No Time'}
            </div>
          </div>
        </div>

        {/* Description */}
        {dish.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark mb-3">Description</h3>
            <p className="text-muted-foreground">{dish.description}</p>
          </div>
        )}

        {/* Ingredients */}
        {dish.ingredients && dish.ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark mb-3">Ingredients</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  {dish.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {dish.instructions && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark mb-3">Instructions</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {dish.instructions}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Serving History */}
        {dishHistory && dishHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark mb-3">Serving History</h3>
            <div className="space-y-3">
              {dishHistory.slice(0, 3).map((event, index) => (
                <Card key={index} className="card-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-dark">{event.event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Served to: {event.guests.join(', ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pairs Well With */}
        {dish.pairsWith && dish.pairsWith.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-dark mb-3">Pairs Well With</h3>
            <div className="flex flex-wrap gap-2">
              {dish.pairsWith.map((pairing, index) => (
                <Badge key={index} variant="outline" className="bg-accent/20">
                  {pairing}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
