/**
 * Browser-local face-skin segmentation with conservative blemish reduction.
 * Uses MediaPipe's face-skin class mask and a 3x3 local-median outlier pass.
 * No whole-face blur is applied; eyes, brows, lips, hair and background are excluded.
 */
let segmenterPromise: Promise<any> | null = null;

async function getSkinSegmenter(): Promise<any> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const moduleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/+esm';
      const { ImageSegmenter, FilesetResolver } = await import(/* @vite-ignore */ moduleUrl) as any;
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
      );
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float16/1/selfie_multiclass_256x256.tflite'
        },
        runningMode: 'IMAGE',
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });
    })().catch((error) => {
      segmenterPromise = null;
      throw error;
    });
  }
  return segmenterPromise;
}

const median = (values: number[]): number => {
  values.sort((a, b) => a - b);
  return values[4];
};

export async function retouchFaceSkinLocally(
  image: HTMLImageElement,
  strength: number
): Promise<HTMLCanvasElement> {
  const segmenter = await getSkinSegmenter();
  const result = segmenter.segment(image);
  const categoryMask = result.categoryMask;
  if (!categoryMask) throw new Error('त्वचा की पहचान नहीं हो सकी। दूसरी साफ़ फोटो आज़माएँ।');

  const maskWidth = categoryMask.width;
  const maskHeight = categoryMask.height;
  const labels = categoryMask.getAsUint8Array();
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height || labels.length !== maskWidth * maskHeight) {
    throw new Error('Skin mask का आकार सही नहीं मिला।');
  }

  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const context = output.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas उपलब्ध नहीं है।');
  context.drawImage(image, 0, 0, width, height);

  // Selfie Multiclass labels: 0 background, 1 hair, 2 body-skin,
  // 3 face-skin, 4 clothes, 5 others. Process face-skin only.
  const original = context.getImageData(0, 0, width, height);
  const pixels = original.data;
  const edited = new Uint8ClampedArray(pixels);
  const safeStrength = Math.max(0, Math.min(100, strength));
  const blendScale = safeStrength / 100;

  // A local 3x3 median repairs isolated high-contrast blemish pixels only.
  // It leaves normal skin texture intact and does not soften the whole face.
  const red = new Array<number>(9);
  const green = new Array<number>(9);
  const blue = new Array<number>(9);
  for (let y = 1; y < height - 1; y++) {
    const maskY = Math.min(maskHeight - 1, Math.floor(y * maskHeight / height));
    for (let x = 1; x < width - 1; x++) {
      const maskX = Math.min(maskWidth - 1, Math.floor(x * maskWidth / width));
      if (labels[maskY * maskWidth + maskX] !== 3) continue;

      let sample = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const offset = ((y + dy) * width + (x + dx)) * 4;
          red[sample] = pixels[offset];
          green[sample] = pixels[offset + 1];
          blue[sample] = pixels[offset + 2];
          sample++;
        }
      }
      const center = (y * width + x) * 4;
      const medR = median(red);
      const medG = median(green);
      const medB = median(blue);
      const deviation = Math.max(
        Math.abs(pixels[center] - medR),
        Math.abs(pixels[center + 1] - medG),
        Math.abs(pixels[center + 2] - medB)
      );
      // Ignore ordinary texture and only gently reduce isolated outliers.
      if (deviation < 18 || blendScale === 0) continue;
      const correction = blendScale * Math.min(0.55, (deviation - 18) / 55);
      edited[center] = pixels[center] + (medR - pixels[center]) * correction;
      edited[center + 1] = pixels[center + 1] + (medG - pixels[center + 1]) * correction;
      edited[center + 2] = pixels[center + 2] + (medB - pixels[center + 2]) * correction;
    }
  }

  original.data.set(edited);
  context.putImageData(original, 0, 0);
  categoryMask.close?.();
  return output;
}
