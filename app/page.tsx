'use client';

import { useState } from "react";
import EmojiGenerator from "@/components/emoji-generator";
import EmojiGrid from "@/components/emoji-grid";

interface Emoji {
  id: string;
  url: string;
  liked: boolean;
  likeCount: number;
}

export default function Home() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const handleGenerate = (newEmoji: Emoji) => {
    setEmojis(prev => [newEmoji, ...prev]);
  };

  const handleLike = (id: string, liked: boolean) => {
    setEmojis(prev => prev.map(emoji => 
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
        <div className="flex items-center gap-2 mb-12">
          <span className="text-4xl">🥺</span>
          <h1 className="text-4xl font-semibold">Emoj maker</h1>
        </div>
        
        <EmojiGenerator onGenerate={handleGenerate} />
        <EmojiGrid 
          emojis={emojis} 
          onLike={handleLike}
        />
      </div>
    </main>
  );
}
