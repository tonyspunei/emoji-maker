'use client';

import { Download, Heart } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";

interface EmojiGridProps {
  emojis: Array<{
    id: string;
    url: string;
    liked: boolean;
    likeCount: number;
  }>;
  onLike?: (id: string, liked: boolean, likeCount: number) => void;
}

export default function EmojiGrid({ emojis, onLike }: EmojiGridProps) {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [likingStates, setLikingStates] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadingImages(prev => ({ ...prev, [id]: false }));
  };

  // Pre-cache images
  useEffect(() => {
    emojis.forEach(emoji => {
      // Create a hidden image element
      const preloadImage = document.createElement('img');
      preloadImage.src = emoji.url;
      preloadImage.onload = () => handleImageLoad(emoji.id);
    });
  }, [emojis]);

  const handleDownload = async (url: string) => {
    try {
      // For data URLs
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `emoji-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // For regular URLs
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `emoji-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleLike = async (id: string, liked: boolean) => {
    try {
      setLikingStates(prev => ({ ...prev, [id]: true }));
      
      const response = await fetch('/api/emojis/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId: id, liked }),
      });

      if (!response.ok) throw new Error('Failed to update like');
      
      const data = await response.json();
      
      // Call onLike with the updated data
      onLike?.(id, data.liked, data.likes_count);
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setLikingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {emojis.map((emoji) => (
        <div 
          key={emoji.id} 
          className="relative aspect-square bg-gray-100 rounded-lg group"
        >
          <Image
            src={emoji.url}
            alt="Generated emoji"
            width={1024}
            height={1024}
            className="rounded-lg object-cover"
            priority
            onLoad={() => handleImageLoad(emoji.id)}
            onError={(e) => {
              console.error('Error loading image:', emoji.url);
              handleImageLoad(emoji.id);
            }}
          />
          
          {/* Overlay with buttons */}
          <div 
            className={`absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2`}
          >
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleDownload(emoji.url)}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleLike(emoji.id, !emoji.liked)}
              disabled={likingStates[emoji.id]}
            >
              <Heart 
                className={`h-5 w-5 ${
                  likingStates[emoji.id] ? 'animate-pulse' : ''
                } ${emoji.liked ? 'fill-white' : ''}`} 
              />
            </Button>
          </div>

          {/* Like counter */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="bg-black/40 px-2 py-1 rounded-full flex items-center gap-1">
              <Heart className={`h-3 w-3 ${emoji.liked ? 'fill-white' : ''} text-white`} />
              <span className="text-xs text-white font-medium">
                {emoji.likeCount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 