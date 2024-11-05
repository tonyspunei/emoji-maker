import { supabaseAdmin } from './supabase';

export async function uploadImageToStorage(
  base64Image: string,
  fileName: string
): Promise<string> {
  // Remove the data URL prefix to get just the base64 content
  const base64Content = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  // Convert base64 to Blob
  const blob = Buffer.from(base64Content, 'base64');
  
  // Upload to Supabase storage using admin client
  const { _data, error } = await supabaseAdmin.storage
    .from('emojis')
    .upload(`public/${fileName}`, blob, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('emojis')
    .getPublicUrl(`public/${fileName}`);

  return publicUrl;
} 