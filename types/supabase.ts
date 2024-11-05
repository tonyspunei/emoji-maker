export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          credits: number;
          tier: 'free' | 'pro';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          credits?: number;
          tier?: 'free' | 'pro';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          credits?: number;
          tier?: 'free' | 'pro';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emojis: {
        Row: {
          id: number;
          image_url: string;
          prompt: string;
          likes_count: number;
          creator_user_id: string;
          created_at: string;
        };
        Insert: {
          image_url: string;
          prompt: string;
          likes_count?: number;
          creator_user_id: string;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          prompt?: string;
          likes_count?: number;
          creator_user_id?: string;
          created_at?: string;
        };
      };
      emoji_likes: {
        Row: {
          user_id: string;
          emoji_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          emoji_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          emoji_id?: number;
          created_at?: string;
        };
      };
    };
  };
} 