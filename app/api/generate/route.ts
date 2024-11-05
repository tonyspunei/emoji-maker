import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Replicate from 'replicate';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadImageToStorage } from '@/lib/storage';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ReplicateOutput {
  [key: string]: any;
  0?: string | ReadableStream;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prompt } = await req.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    // Check user's credits using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile || profile.credits <= 0) {
      return NextResponse.json(
        { error: 'No credits remaining' },
        { status: 403 }
      );
    }

    console.log('Generating emoji with prompt:', prompt);

    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          width: 1024,
          height: 1024,
          prompt: `A TOK emoji of ${prompt}`,
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "",
          prompt_strength: 0.8,
          num_inference_steps: 50
        }
      }
    ) as ReplicateOutput;

    let imageUrl: string;

    // Handle different output formats
    if (Array.isArray(output) && typeof output[0] === 'string' && output[0].startsWith('http')) {
      // For URL outputs, fetch the image and upload to Supabase
      const response = await fetch(output[0]);
      const blob = await response.blob();
      const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      imageUrl = await uploadImageToStorage(dataUrl, `emoji-${Date.now()}.png`);
    } else if (output && typeof output === 'object' && output[0] instanceof ReadableStream) {
      // For stream outputs, combine chunks and upload
      const stream = output[0] as ReadableStream;
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      const base64 = Buffer.from(concatenated).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      imageUrl = await uploadImageToStorage(dataUrl, `emoji-${Date.now()}.png`);
    } else {
      throw new Error('Invalid response format from Replicate');
    }

    // Save to database using admin client
    const { data: emoji, error: insertError } = await supabaseAdmin
      .from('emojis')
      .insert([
        {
          image_url: imageUrl,
          prompt,
          creator_user_id: userId,
          likes_count: 0
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Decrement user's credits using admin client
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      url: imageUrl,
      id: emoji.id.toString()
    });

  } catch (error) {
    console.error('Error generating emoji:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate emoji' },
      { status: 500 }
    );
  }
}