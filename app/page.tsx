'use client';

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useEmojis } from "@/hooks/use-emojis";
import EmojiGenerator from "@/components/emoji-generator";
import EmojiGrid from "@/components/emoji-grid";

interface Emoji {
  id: string;
  url: string;
  liked: boolean;
  likeCount: number;
}

export default function Home() {
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { emojis: dbEmojis, isLoading: emojisLoading, refetch: refetchEmojis } = useEmojis();
  const [localEmojis, setLocalEmojis] = useState<Emoji[]>([]);

  // Transform database emojis to component format and update local state
  useEffect(() => {
    if (dbEmojis) {
      const transformed = dbEmojis.map(emoji => ({
        id: emoji.id.toString(),
        url: emoji.image_url,
        liked: false,
        likeCount: emoji.likes_count
      }));
      setLocalEmojis(transformed);
    }
  }, [dbEmojis]);

  const handleGenerate = async (newEmoji: Emoji) => {
    // Refetch emojis after generating a new one
    await refetchEmojis();
  };

  const handleCreditsUpdate = async () => {
    // Refetch profile to update credits display
    await refetchProfile();
  };

  const handleLike = async (id: string, liked: boolean) => {
    setLocalEmojis(prev => prev.map(emoji => 
      emoji.id === id 
        ? { 
            ...emoji, 
            liked,
            likeCount: liked ? emoji.likeCount + 1 : Math.max(0, emoji.likeCount - 1)
          } 
        : emoji
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🥺</span>
            <h1 className="text-4xl font-semibold">Emoj maker</h1>
          </div>
          
          {profile && (
            <div className="text-sm text-gray-600">
              Credits remaining: {profile.credits}
            </div>
          )}
        </div>
        
        <EmojiGenerator 
          onGenerate={handleGenerate} 
          onCreditsUpdate={handleCreditsUpdate}
        />
        
        {emojisLoading ? (
          <div className="mt-8 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <EmojiGrid 
            emojis={localEmojis} 
            onLike={handleLike}
          />
        )}
      </div>
    </main>
  );
}
