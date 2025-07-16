import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Guests from "@/pages/guests";
import GuestProfile from "@/pages/guest-profile";
import Dishes from "@/pages/dishes";
import DishDetail from "@/pages/dish-detail";
import AddEvent from "@/pages/add-event";
import AddGuest from "@/pages/add-guest";
import AddDish from "@/pages/add-dish";
import Search from "@/pages/search";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/guests" component={Guests} />
          <Route path="/guests/:id" component={GuestProfile} />
          <Route path="/dishes" component={Dishes} />
          <Route path="/dishes/:id" component={DishDetail} />
          <Route path="/add-event" component={AddEvent} />
          <Route path="/add-guest" component={AddGuest} />
          <Route path="/add-dish" component={AddDish} />
          <Route path="/search" component={Search} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
