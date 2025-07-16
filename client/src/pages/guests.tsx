import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Search, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import { Guest } from "@shared/schema";
import { format } from "date-fns";

export default function Guests() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const filteredGuests = guests?.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <h1 className="text-xl font-semibold text-dark">Guests</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/add-guest')}
          >
            <Plus className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-background">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Guest List */}
      <main className="p-6 space-y-4 pb-24">
        {guestsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : filteredGuests.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No guests found matching your search" : "No guests added yet"}
              </p>
              <Button 
                onClick={() => navigate('/add-guest')}
                className="bg-primary hover:bg-primary/90"
              >
                Add Your First Guest
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGuests.map((guest) => (
            <Card 
              key={guest.id} 
              className="card-shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/guests/${guest.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark">{guest.name}</h3>
                    {guest.email && (
                      <p className="text-sm text-muted-foreground">{guest.email}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-2">
                      {guest.dietaryRestrictions?.map((restriction) => (
                        <Badge key={restriction} variant="secondary" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                      {guest.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
