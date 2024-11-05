import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      throw fetchError;
    }

    // If profile doesn't exist, create one
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            credits: 3,
            tier: 'free'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error managing profile:', error);
    return NextResponse.json(
      { error: 'Failed to manage profile' },
      { status: 500 }
    );
  }
} 