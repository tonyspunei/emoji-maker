import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type EmojiLike = Database['public']['Tables']['emoji_likes']['Row'];

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all emojis with their like status for the current user
    const { data: emojis, error } = await supabaseAdmin
      .from('emojis')
      .select(`
        *,
        emoji_likes!left (
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to include liked status
    const transformedEmojis = emojis.map(emoji => ({
      ...emoji,
      liked: emoji.emoji_likes?.some((like: EmojiLike) => like.user_id === userId) || false
    }));

    return NextResponse.json(transformedEmojis);

  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emojis' },
      { status: 500 }
    );
  }
} 