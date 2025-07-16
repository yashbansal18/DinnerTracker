import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Users, Plus, Minus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertGuestSchema } from "@shared/schema";

export default function AddGuest() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);

  const [newRestriction, setNewRestriction] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");

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

  const createGuestMutation = useMutation({
    mutationFn: async (guestData: any) => {
      const response = await apiRequest('POST', '/api/guests', guestData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Guest added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      navigate('/guests');
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
        description: "Failed to add guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the guest.",
        variant: "destructive",
      });
      return;
    }

    const guestData = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : null,
      tags: tags.length > 0 ? tags : null,
      notes: notes.trim() || null,
      favoriteCategories: favoriteCategories.length > 0 ? favoriteCategories : null,
    };

    createGuestMutation.mutate(guestData);
  };

  const addRestriction = () => {
    if (newRestriction.trim() && !dietaryRestrictions.includes(newRestriction.trim())) {
      setDietaryRestrictions([...dietaryRestrictions, newRestriction.trim()]);
      setNewRestriction("");
    }
  };

  const removeRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addCategory = () => {
    if (newCategory.trim() && !favoriteCategories.includes(newCategory.trim())) {
      setFavoriteCategories([...favoriteCategories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setFavoriteCategories(favoriteCategories.filter(c => c !== category));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
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
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Add Guest</h1>
          <Button 
            onClick={handleSubmit}
            disabled={createGuestMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createGuestMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="p-6 space-y-6">
        {/* Basic Information */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter guest name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Restrictions */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Dietary Restrictions</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add dietary restriction"
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRestriction()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addRestriction}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {dietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dietaryRestrictions.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {restriction}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRestriction(restriction)}
                        className="ml-1 h-4 w-4 p-0 hover:bg-green-200"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Tags</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tag (e.g., Family, Work Friends)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-4 w-4 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Categories */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Favorite Food Categories</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add favorite category (e.g., Italian, Desserts)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addCategory}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {favoriteCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {favoriteCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {category}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(category)}
                        className="ml-1 h-4 w-4 p-0 hover:bg-blue-200"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Notes</h3>
            <Textarea
              placeholder="Add any additional notes about this guest..."
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
