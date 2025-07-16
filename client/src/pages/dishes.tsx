import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Search, UtensilsCrossed, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import { Dish } from "@shared/schema";

export default function Dishes() {
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

  const { data: dishes, isLoading: dishesLoading } = useQuery({
    queryKey: ['/api/dishes'],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const allCategories = ["All", "Vegetarian", "Desserts", "Main Course", "Appetizers", "Sides"];
  
  const filteredDishes = dishes?.filter(dish => {
    const matchesSearch = dish.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || 
                         dish.category === activeFilter || 
                         dish.tags?.includes(activeFilter);
    return matchesSearch && matchesFilter;
  }) || [];

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
          <h1 className="text-xl font-semibold text-dark">Dish Library</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/add-dish')}
          >
            <Plus className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="px-6 py-4 bg-background">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap ${
                activeFilter === category 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Dish Grid */}
      <main className="p-6 pb-24">
        {dishesLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeFilter !== "All" 
                  ? "No dishes found matching your criteria" 
                  : "No dishes added yet"}
              </p>
              <Button 
                onClick={() => navigate('/add-dish')}
                className="bg-primary hover:bg-primary/90"
              >
                Add Your First Dish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredDishes.map((dish) => (
              <Card 
                key={dish.id} 
                className="card-shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/dishes/${dish.id}`)}
              >
                <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                  {dish.imageUrl ? (
                    <img 
                      src={dish.imageUrl} 
                      alt={dish.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-dark truncate">{dish.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dish.category} • {dish.tags?.[0] || 'No tags'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {dish.prepTime ? `${dish.prepTime} min` : 'No prep time'}
                    </span>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 text-destructive mr-1" />
                      <span className="text-xs text-muted-foreground">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
