'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

interface Emoji {
  id: string;
  url: string;
  liked: boolean;
  likeCount: number;
}

interface EmojiGeneratorProps {
  onGenerate?: (emoji: Emoji) => void;
}

export default function EmojiGenerator({ onGenerate }: EmojiGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error('No image was generated');
      }

      // Create new emoji object
      const newEmoji: Emoji = {
        id: data.id,
        url: data.url,
        liked: false,
        likeCount: 0,
      };

      // Call the onGenerate callback with the new emoji
      onGenerate?.(newEmoji);
      
      // Clear the input
      setPrompt("");
      
    } catch (error) {
      console.error('Error generating emoji:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate emoji');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="flex gap-3">
        <Input
          placeholder="Enter a prompt to generate an emoji"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 h-12 rounded-xl border-gray-200 bg-white shadow-sm"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </form>
  );
} 