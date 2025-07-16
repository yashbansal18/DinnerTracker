import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Camera } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: File | null;
  placeholder?: string;
}

export default function ImageUpload({ onImageSelect, currentImage, placeholder = "Upload an image" }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      onImageSelect(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {previewUrl || currentImage ? (
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl || (currentImage ? URL.createObjectURL(currentImage) : '')}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardContent className="p-3">
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={handleUploadClick}
        >
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">{placeholder}</p>
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG, GIF up to 5MB
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
