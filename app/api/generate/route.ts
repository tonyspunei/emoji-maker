import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

type ReplicateOutput = string[] | { [key: string]: any };

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
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

    console.log('Raw output:', output);

    // If output is a string array (URL case)
    if (Array.isArray(output) && typeof output[0] === 'string' && output[0].startsWith('http')) {
      return NextResponse.json({ 
        url: output[0],
        id: Date.now().toString()
      });
    }

    // If output is a ReadableStream
    if (output && typeof output === 'object' && output[0] instanceof ReadableStream) {
      const stream = output[0] as ReadableStream;
      const reader = stream.getReader();
      let chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Combine chunks into a single Uint8Array
      const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to base64
      const base64 = Buffer.from(concatenated).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({ 
        url: dataUrl,
        id: Date.now().toString()
      });
    }

    throw new Error('Invalid response format from Replicate');

  } catch (error) {
    console.error('Error generating emoji:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate emoji' },
      { status: 500 }
    );
  }
}