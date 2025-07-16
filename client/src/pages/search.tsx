import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search as SearchIcon, Clock, AlertTriangle, Calendar, Leaf, Heart, Users, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import { format } from "date-fns";

export default function Search() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const filters = ["All", "Guests", "Dishes", "Events"];
  
  const filteredResults = () => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    let results: any[] = [];
    
    if (activeFilter === "All" || activeFilter === "Guests") {
      const matchingGuests = guests?.filter(guest => 
        guest.name.toLowerCase().includes(term) ||
        guest.email?.toLowerCase().includes(term) ||
        guest.dietaryRestrictions?.some(r => r.toLowerCase().includes(term)) ||
        guest.tags?.some(t => t.toLowerCase().includes(term))
      ).map(guest => ({ ...guest, type: 'guest' })) || [];
      results = [...results, ...matchingGuests];
    }
    
    if (activeFilter === "All" || activeFilter === "Dishes") {
      const matchingDishes = dishes?.filter(dish => 
        dish.title.toLowerCase().includes(term) ||
        dish.description?.toLowerCase().includes(term) ||
        dish.category?.toLowerCase().includes(term) ||
        dish.tags?.some(t => t.toLowerCase().includes(term)) ||
        dish.ingredients?.some(i => i.toLowerCase().includes(term))
      ).map(dish => ({ ...dish, type: 'dish' })) || [];
      results = [...results, ...matchingDishes];
    }
    
    if (activeFilter === "All" || activeFilter === "Events") {
      const matchingEvents = events?.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.notes?.toLowerCase().includes(term)
      ).map(event => ({ ...event, type: 'event' })) || [];
      results = [...results, ...matchingEvents];
    }
    
    return results;
  };

  const results = filteredResults();

  const handleQuickFilter = (filterType: string) => {
    setActiveFilter(filterType);
    switch (filterType) {
      case "Repeat Dishes":
        // This would need additional logic to find repeat dishes
        break;
      case "This Month":
        setActiveFilter("Events");
        break;
      case "Vegetarian":
        setActiveFilter("Dishes");
        setSearchTerm("vegetarian");
        break;
      case "Favorites":
        // This would need additional logic to find favorite dishes
        break;
    }
  };

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
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Search</h1>
          <div></div>
        </div>
      </header>

      {/* Search Interface */}
      <div className="p-6 pb-24">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests, dishes, or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Filter Options */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Results or Default Content */}
        {searchTerm.trim() ? (
          <div className="space-y-4">
            {results.length === 0 ? (
              <Card className="card-shadow">
                <CardContent className="p-6 text-center">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                </CardContent>
              </Card>
            ) : (
              results.map((result) => (
                <Card 
                  key={`${result.type}-${result.id}`} 
                  className="card-shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (result.type === 'guest') navigate(`/guests/${result.id}`);
                    else if (result.type === 'dish') navigate(`/dishes/${result.id}`);
                    // Events don't have detail pages yet
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {result.type === 'guest' && <Users className="w-6 h-6 text-primary" />}
                        {result.type === 'dish' && <UtensilsCrossed className="w-6 h-6 text-secondary" />}
                        {result.type === 'event' && <Calendar className="w-6 h-6 text-accent-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-dark">
                            {result.type === 'guest' ? result.name : result.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.type === 'guest' && (
                          <p className="text-sm text-muted-foreground">
                            {result.email || 'No email'}
                          </p>
                        )}
                        {result.type === 'dish' && (
                          <p className="text-sm text-muted-foreground">
                            {result.category || 'No category'} • {result.tags?.[0] || 'No tags'}
                          </p>
                        )}
                        {result.type === 'event' && (
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(result.date), 'MMM dd, yyyy')} • {result.location || 'No location'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            <div className="mb-6">
              <h3 className="font-semibold text-dark mb-3">Recent Searches</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-xl">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Emily Johnson</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-xl">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Chicken Parmesan</span>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <h3 className="font-semibold text-dark mb-3">Quick Filters</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuickFilter("Repeat Dishes")}
                  className="bg-background p-4 h-auto text-left flex flex-col items-start space-y-2 card-shadow"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="font-medium text-dark">Repeat Dishes</div>
                    <div className="text-sm text-muted-foreground">Find duplicate meals</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickFilter("This Month")}
                  className="bg-background p-4 h-auto text-left flex flex-col items-start space-y-2 card-shadow"
                >
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-dark">This Month</div>
                    <div className="text-sm text-muted-foreground">Recent events</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickFilter("Vegetarian")}
                  className="bg-background p-4 h-auto text-left flex flex-col items-start space-y-2 card-shadow"
                >
                  <Leaf className="w-5 h-5 text-success" />
                  <div>
                    <div className="font-medium text-dark">Vegetarian</div>
                    <div className="text-sm text-muted-foreground">Plant-based dishes</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickFilter("Favorites")}
                  className="bg-background p-4 h-auto text-left flex flex-col items-start space-y-2 card-shadow"
                >
                  <Heart className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="font-medium text-dark">Favorites</div>
                    <div className="text-sm text-muted-foreground">Most loved dishes</div>
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
