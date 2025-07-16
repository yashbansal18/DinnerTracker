import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, UtensilsCrossed, Plus, Minus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertDishSchema } from "@shared/schema";
import ImageUpload from "@/components/image-upload";

export default function AddDish() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pairsWith, setPairsWith] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const [newIngredient, setNewIngredient] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newPairing, setNewPairing] = useState("");

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

  const createDishMutation = useMutation({
    mutationFn: async (dishData: FormData) => {
      const response = await fetch('/api/dishes', {
        method: 'POST',
        body: dishData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dish added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
      navigate('/dishes');
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
        description: "Failed to add dish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the dish.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('instructions', instructions.trim());
    formData.append('prepTime', prepTime);
    formData.append('servings', servings);
    formData.append('category', category);
    formData.append('tags', JSON.stringify(tags));
    formData.append('pairsWith', JSON.stringify(pairsWith));
    
    if (image) {
      formData.append('image', image);
    }

    createDishMutation.mutate(formData);
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
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

  const addPairing = () => {
    if (newPairing.trim() && !pairsWith.includes(newPairing.trim())) {
      setPairsWith([...pairsWith, newPairing.trim()]);
      setNewPairing("");
    }
  };

  const removePairing = (pairing: string) => {
    setPairsWith(pairsWith.filter(p => p !== pairing));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
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
            onClick={() => navigate('/dishes')}
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-dark">Add Dish</h1>
          <Button 
            onClick={handleSubmit}
            disabled={createDishMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createDishMutation.isPending ? "Saving..." : "Save"}
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
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Dish Name *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter dish name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the dish"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prepTime" className="text-sm font-medium text-foreground">
                    Prep Time (minutes)
                  </Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="30"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="servings" className="text-sm font-medium text-foreground">
                    Servings
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    placeholder="4"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category
                </Label>
                <Input
                  id="category"
                  type="text"
                  placeholder="e.g., Main Course, Dessert, Appetizer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Photo</h3>
            <ImageUpload
              onImageSelect={setImage}
              currentImage={image}
              placeholder="Upload a photo of your dish"
            />
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Ingredients</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add ingredient"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addIngredient}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {ingredients.length > 0 && (
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{ingredient}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ingredient)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Instructions</h3>
            <Textarea
              placeholder="Enter cooking instructions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="resize-none"
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Tags</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tag (e.g., vegetarian, spicy)"
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
                    <Badge key={tag} variant="secondary">
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

        {/* Pairs Well With */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark mb-4">Pairs Well With</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add pairing (e.g., Caesar Salad, Red Wine)"
                  value={newPairing}
                  onChange={(e) => setNewPairing(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPairing()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addPairing}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {pairsWith.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pairsWith.map((pairing) => (
                    <Badge key={pairing} variant="outline" className="bg-accent/20">
                      {pairing}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePairing(pairing)}
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
      </main>
    </div>
  );
}
