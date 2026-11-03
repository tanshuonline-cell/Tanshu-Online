import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

let modelPromise: Promise<bodyPix.BodyPix> | null = null;
let segmentationQueue: Promise<unknown> = Promise.resolve();

const getModel = () => {
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      // ResNet50 is heavier than MobileNet, but is more suitable for portrait edges,
      // clothing and arms than the lightweight model used previously.
      return bodyPix.load({
        architecture: 'ResNet50',
        outputStride: 16,
        quantBytes: 2
      });
    })().catch((error) => { modelPromise = null; throw error; });
  }
  return modelPromise;
};

function preserveFineForeground(input: Uint8Array, width: number, height: number): Uint8Array {
  // BodyPix returns a low-resolution binary mask. Expand foreground by one
  // mask pixel instead of doing close (dilate + erode), because erosion can
  // remove narrow wrists, fingers, hair strands and garment edges.
  const expanded = new Uint8Array(input.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let foreground = false;
      for (let dy = -1; dy <= 1 && !foreground; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && input[ny * width + nx] > 0) {
            foreground = true;
            break;
          }
        }
      }
      expanded[y * width + x] = foreground ? 1 : 0;
    }
  }
  return expanded;
}

export async function removeBackgroundAI(source: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image could not be loaded for AI processing.'));
    img.src = source;
  });
  const model = await getModel();

  // Serialize inference calls: repeated clicks should not race the same WebGL model.
  const runSegmentation = async () => model.segmentPerson(image, {
    internalResolution: 'full',
    segmentationThreshold: 0.16,
    maxDetections: 1,
    scoreThreshold: 0.08,
    nmsRadius: 20
  });
  const current = segmentationQueue.then(runSegmentation, runSegmentation);
  segmentationQueue = current.then(() => undefined, () => undefined);
  const segmentation = await current;

  const foregroundRatio = segmentation.data.reduce((count, value) => count + (value > 0 ? 1 : 0), 0) / segmentation.data.length;
  if (foregroundRatio < 0.003 || foregroundRatio > 0.995) {
    throw new Error('इस फोटो में व्यक्ति का सही mask नहीं बन पाया। मूल फोटो सुरक्षित रखी गई है। कृपया दूसरी साफ़ फोटो चुनें या फिर कोशिश करें।');
  }

  const cleanedMask = preserveFineForeground(segmentation.data, segmentation.width, segmentation.height);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.drawImage(image, 0, 0);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = segmentation.width;
  maskCanvas.height = segmentation.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error('AI mask could not be created.');
  const maskImage = maskCtx.createImageData(segmentation.width, segmentation.height);
  for (let i = 0; i < cleanedMask.length; i++) {
    const offset = i * 4;
    maskImage.data[offset] = 255;
    maskImage.data[offset + 1] = 255;
    maskImage.data[offset + 2] = 255;
    maskImage.data[offset + 3] = cleanedMask[i] ? 255 : 0;
  }
  maskCtx.putImageData(maskImage, 0, 0);

  // Apply a very small feather at the silhouette. A broad blur would erase hair
  // and thin details, so keep the edge transition narrow.
  ctx.globalCompositeOperation = 'destination-in';
  ctx.filter = 'blur(0.35px)';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';

  // Decontaminate semi-transparent edge pixels using the image's corner matte.
  // This reduces the white halo left around a subject photographed on white.
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const original = document.createElement('canvas');
  original.width = canvas.width;
  original.height = canvas.height;
  const originalCtx = original.getContext('2d', { willReadFrequently: true });
  if (originalCtx) {
    originalCtx.drawImage(image, 0, 0);
    const sourcePixels = originalCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const corners = [
      [0, 0], [canvas.width - 1, 0],
      [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
    ];
    const cornerColors = corners.map(([x, y]) => [0, 1, 2].map((channel) => sourcePixels[(y * canvas.width + x) * 4 + channel]));
    const matte = [0, 1, 2].map((channel) => Math.round(
      cornerColors.reduce((sum, rgb) => sum + rgb[channel], 0) / cornerColors.length
    ));
    const cornerSpread = Math.max(...cornerColors.flatMap((rgb) => rgb.map((value, channel) => Math.abs(value - matte[channel]))));
    // Avoid colour decontamination when the photo corners do not share a
    // reasonably uniform background; an incorrect matte can damage skin/clothes.
    if (cornerSpread <= 42) {
      for (let i = 0; i < pixels.data.length; i += 4) {
        const alpha = pixels.data[i + 3] / 255;
        if (alpha <= 0.12 || alpha >= 0.94) continue;
        for (let channel = 0; channel < 3; channel++) {
          const observed = sourcePixels[i + channel];
          pixels.data[i + channel] = Math.max(0, Math.min(255,
            Math.round((observed - matte[channel] * (1 - alpha)) / alpha)
          ));
        }
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('AI cutout export failed.')), 'image/png');
  });
}
