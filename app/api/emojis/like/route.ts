import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { emojiId, liked } = await req.json();

    // First get current likes_count
    const { data: currentEmoji, error: fetchError } = await supabaseAdmin
      .from('emojis')
      .select('likes_count')
      .eq('id', emojiId)
      .single();

    if (fetchError) throw fetchError;

    const currentLikes = currentEmoji?.likes_count || 0;
    const newLikesCount = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    // Update likes count
    const { data: emoji, error: updateError } = await supabaseAdmin
      .from('emojis')
      .update({ likes_count: newLikesCount })
      .eq('id', emojiId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      likes_count: emoji.likes_count,
      liked
    });

  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { error: 'Failed to update likes' },
      { status: 500 }
    );
  }
} 