import { removeBackground } from '@bg0/browser';

/**
 * Runs background removal locally in the visitor's browser through BG0.
 * The selected photo is never uploaded to our server or a paid inference API.
 */
export async function removeBackgroundAI(
  source: string,
  onProgress?: (message: string) => void
): Promise<Blob> {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error('The selected image could not be read. Please upload it again.');
  }

  const input = await response.blob();
  if (!input.type.startsWith('image/')) {
    throw new Error('Please choose a JPG, PNG, or WEBP image.');
  }

  try {
    const result = await removeBackground(input, {
      quality: 'quality',
      onProgress: ({ progress }) => {
        const percent = typeof progress === 'number'
          ? ` ${Math.round(progress * 100)}%`
          : '';
        onProgress?.(`Processing background removal…${percent}`);
      }
    });
    return result.blob;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI background removal failed.';
    throw new Error(`AI background removal: ${message}`);
  }
}
