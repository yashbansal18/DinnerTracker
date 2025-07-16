import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Users, UtensilsCrossed, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema } from "@shared/schema";

export default function AddEvent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<number[]>([]);

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

  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ['/api/guests'],
    enabled: isAuthenticated,
  });

  const { data: dishes, isLoading: dishesLoading } = useQuery({
    queryKey: ['/api/dishes'],
    enabled: isAuthenticated,
  });

  const { data: repeatAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/repeat-dish-alerts'],
    enabled: isAuthenticated && selectedGuests.length > 0 && selectedDishes.length > 0,
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/repeat-dish-alerts', {
        guestIds: selectedGuests,
        dishIds: selectedDishes,
      });
      return response.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest('POST', '/api/events', eventData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      navigate('/');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      title,
      date: new Date(date).toISOString(),
      location: location || null,
      notes: notes || null,
      guestIds: selectedGuests,
      dishIds: selectedDishes,
    };

    createEventMutation.mutate(eventData);
  };

  const toggleGuest = (guestId: number) => {
    setSelectedGuests(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const toggleDish = (dishId: number) => {
    setSelectedDishes(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
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
            onClick={() => navigate('/')}
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Add Event</h1>
          <Button 
            onClick={handleSubmit}
            disabled={createEventMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createEventMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="p-6 space-y-6">
        {/* Event Details */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Event Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Event Name *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Book Club Dinner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., My Home"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Selection */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Select Guests</h3>
            {guestsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : !guests || guests.length === 0 ? (
              <p className="text-muted-foreground">
                No guests available. Add some guests first!
              </p>
            ) : (
              <div className="space-y-3">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`guest-${guest.id}`}
                      checked={selectedGuests.includes(guest.id)}
                      onCheckedChange={() => toggleGuest(guest.id)}
                    />
                    <Label 
                      htmlFor={`guest-${guest.id}`}
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-dark">{guest.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {guest.dietaryRestrictions?.join(', ') || 'No restrictions'}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dish Selection */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Select Dishes</h3>
            {dishesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : !dishes || dishes.length === 0 ? (
              <p className="text-muted-foreground">
                No dishes available. Add some dishes first!
              </p>
            ) : (
              <div className="space-y-3">
                {dishes.map((dish) => {
                  const isRepeated = repeatAlerts?.some(
                    alert => alert.dish.id === dish.id
                  );
                  
                  return (
                    <div key={dish.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`dish-${dish.id}`}
                        checked={selectedDishes.includes(dish.id)}
                        onCheckedChange={() => toggleDish(dish.id)}
                      />
                      <Label 
                        htmlFor={`dish-${dish.id}`}
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          {dish.imageUrl ? (
                            <img 
                              src={dish.imageUrl} 
                              alt={dish.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-dark">{dish.title}</div>
                          <div className={`text-sm flex items-center ${
                            isRepeated ? 'text-destructive' : 'text-success'
                          }`}>
                            {isRepeated ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Served recently to selected guests
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                New for this group
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Notes</h3>
            <Textarea
              placeholder="Wine pairings, special occasions, guest reactions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
