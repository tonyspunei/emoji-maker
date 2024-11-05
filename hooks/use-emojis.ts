import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  created_at: string;
  liked: boolean;
}

export function useEmojis() {
  const { isLoaded, isSignedIn } = useUser();
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmojis() {
      if (!isLoaded || !isSignedIn) return;

      try {
        const response = await fetch('/api/emojis');
        if (!response.ok) throw new Error('Failed to load emojis');
        
        const data = await response.json();
        setEmojis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load emojis');
      } finally {
        setIsLoading(false);
      }
    }

    loadEmojis();
  }, [isLoaded, isSignedIn]);

  return {
    emojis,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/emojis');
        if (!response.ok) throw new Error('Failed to load emojis');
        
        const data = await response.json();
        setEmojis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load emojis');
      } finally {
        setIsLoading(false);
      }
    }
  };
} 