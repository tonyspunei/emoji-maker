'use client';

import { Download, Heart } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";

interface EmojiGridProps {
  emojis: Array<{
    id: string;
    url: string;
    liked: boolean;
  }>;
}

export default function EmojiGrid({ emojis }: EmojiGridProps) {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadingImages(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {emojis.map((emoji) => (
        <div key={emoji.id} className="relative aspect-square bg-gray-100 rounded-lg">
          {loadingImages[emoji.id] !== false && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={emoji.url}
            alt="Generated emoji"
            width={1024}
            height={1024}
            className={`rounded-lg object-cover transition-opacity duration-200 ${
              loadingImages[emoji.id] === false ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(emoji.id)}
            onError={(e) => {
              console.error('Error loading image:', emoji.url);
              handleImageLoad(emoji.id);
            }}
          />
        </div>
      ))}
    </div>
  );
} 