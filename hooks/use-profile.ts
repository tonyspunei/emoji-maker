import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Profile {
  user_id: string;
  credits: number;
  tier: 'free' | 'pro';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { isLoaded, isSignedIn } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isLoaded || !isSignedIn) return;

      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [isLoaded, isSignedIn]);

  return {
    profile,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
  };
} 