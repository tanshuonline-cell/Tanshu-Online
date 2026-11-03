/**
 * Browser-local face-skin segmentation and conservative skin retouch.
 * MediaPipe's selfie multiclass model provides a face-skin category mask.
 * Eyes, brows, lips, hair and background are excluded by the segmentation mask.
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
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas उपलब्ध नहीं है।');
  outputContext.drawImage(image, 0, 0, width, height);

  // Selfie Multiclass labels: 0 background, 1 hair, 2 body-skin,
  // 3 face-skin, 4 clothes, 5 others. Retouch face-skin only.
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) throw new Error('Skin mask तैयार नहीं हो सका।');
  const maskImage = maskContext.createImageData(maskWidth, maskHeight);
  for (let i = 0; i < labels.length; i++) {
    const alpha = labels[i] === 3 ? 255 : 0;
    const offset = i * 4;
    maskImage.data[offset] = 255;
    maskImage.data[offset + 1] = 255;
    maskImage.data[offset + 2] = 255;
    maskImage.data[offset + 3] = alpha;
  }
  const smallMask = document.createElement('canvas');
  smallMask.width = maskWidth;
  smallMask.height = maskHeight;
  smallMask.getContext('2d')?.putImageData(maskImage, 0, 0);
  // Upscale and feather the segmentation edge to avoid visible cut-out borders.
  maskContext.filter = 'blur(2px)';
  maskContext.drawImage(smallMask, 0, 0, width, height);
  maskContext.filter = 'none';

  const blurred = document.createElement('canvas');
  blurred.width = width;
  blurred.height = height;
  const blurredContext = blurred.getContext('2d');
  if (!blurredContext) throw new Error('Retouch canvas तैयार नहीं हो सका।');
  // Keep blur radius deliberately low so skin texture remains natural.
  const safeStrength = Math.max(0, Math.min(100, strength));
  const radius = 0.6 + safeStrength * 0.025;
  blurredContext.filter = `blur(${radius.toFixed(2)}px)`;
  blurredContext.drawImage(image, 0, 0, width, height);
  blurredContext.filter = 'none';
  blurredContext.globalCompositeOperation = 'destination-in';
  blurredContext.drawImage(maskCanvas, 0, 0);
  blurredContext.globalCompositeOperation = 'source-over';

  // Cap blend to preserve pores and avoid the waxy/blurred look.
  outputContext.globalAlpha = safeStrength / 100 * 0.38;
  outputContext.drawImage(blurred, 0, 0);
  outputContext.globalAlpha = 1;
  categoryMask.close?.();
  return output;
}
