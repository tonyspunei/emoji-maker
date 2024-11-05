'use client';

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

  // Transform database emojis to component format
  const transformedEmojis: Emoji[] = dbEmojis.map(emoji => ({
    id: emoji.id.toString(),
    url: emoji.image_url,
    liked: false,
    likeCount: emoji.likes_count
  }));

  const handleGenerate = async (newEmoji: Emoji) => {
    // Refetch emojis after generating a new one
    await refetchEmojis();
  };

  const handleCreditsUpdate = async () => {
    // Refetch profile to update credits display
    await refetchProfile();
  };

  const handleLike = (id: string, liked: boolean) => {
    // We'll implement this with the likes feature
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
            emojis={transformedEmojis} 
            onLike={handleLike}
          />
        )}
      </div>
    </main>
  );
}
