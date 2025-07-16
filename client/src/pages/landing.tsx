import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Users, Calendar, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">Second Helpings</h1>
          <p className="text-muted-foreground">Never repeat a meal again</p>
        </div>

        <Card className="mb-8 card-shadow">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Second Helpings</CardTitle>
            <CardDescription className="text-center">
              Your personal dinner event manager that helps you track guests, dishes, and meal history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Guests</h3>
                <p className="text-sm text-muted-foreground">Track dietary preferences and meal history</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Dish Library</h3>
                <p className="text-sm text-muted-foreground">Store recipes, ingredients, and photos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Event Planning</h3>
                <p className="text-sm text-muted-foreground">Log dinners and get smart suggestions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground">Avoid repeating dishes for the same guests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={() => window.location.href = '/api/login'} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
