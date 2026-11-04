import { removeBackground } from '@bg0/browser';

/**
 * Runs BiRefNet locally in the visitor's browser through BG0.
 * The selected photo is never uploaded to our server or a paid inference API.
 */
export async function removeBackgroundAI(
  source: string,
  onProgress?: (message: string) => void
): Promise<Blob> {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error('चुनी गई फोटो पढ़ी नहीं जा सकी। कृपया दोबारा अपलोड करें।');
  }

  const input = await response.blob();
  if (!input.type.startsWith('image/')) {
    throw new Error('कृपया JPG, PNG या WEBP फोटो चुनें।');
  }

  try {
    const result = await removeBackground(input, {
      quality: 'quality',
      onProgress: ({ stage, progress, message }) => {
        const percent = typeof progress === 'number'
          ? ` ${Math.round(progress * 100)}%`
          : '';
        onProgress?.(`AI प्रोसेसिंग चल रही है…${percent}`);
      }
    });
    return result.blob;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI background removal failed.';
    throw new Error(`AI background removal: ${message}`);
  }
}
