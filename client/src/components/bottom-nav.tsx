import { Button } from "@/components/ui/button";
import { Home, Users, UtensilsCrossed, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-background shadow-lg rounded-t-xl px-6 py-4 w-full max-w-md border-t">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className={`flex flex-col items-center space-y-1 ${
            isActive('/') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/guests')}
          className={`flex flex-col items-center space-y-1 ${
            isActive('/guests') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Guests</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/dishes')}
          className={`flex flex-col items-center space-y-1 ${
            isActive('/dishes') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-xs">Dishes</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center space-y-1 ${
            isActive('/search') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Search</span>
        </Button>
      </div>
    </nav>
  );
}
