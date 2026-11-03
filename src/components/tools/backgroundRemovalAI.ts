import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

let modelPromise: Promise<bodyPix.BodyPix> | null = null;
const getModel = () => {
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      return bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      });
    })().catch((error) => { modelPromise = null; throw error; });
  }
  return modelPromise;
};

export async function removeBackgroundAI(source: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image could not be loaded for AI processing.'));
    img.src = source;
  });
  const model = await getModel();
  const segmentation = await model.segmentPerson(image, {
    internalResolution: 'high',
    segmentationThreshold: 0.35,
    maxDetections: 1,
    scoreThreshold: 0.2,
    nmsRadius: 20
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.drawImage(image, 0, 0);
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = segmentation.width;
  maskCanvas.height = segmentation.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error('AI mask could not be created.');
  const foregroundCount = segmentation.data.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
  const foregroundRatio = foregroundCount / segmentation.data.length;
  if (foregroundRatio < 0.015 || foregroundRatio > 0.97) {
    throw new Error('इस फोटो में व्यक्ति साफ़ पहचान में नहीं आया। फोटो गायब करने के बजाय मूल फोटो सुरक्षित रखी गई है। बेहतर रोशनी और साफ़ subject वाली फोटो चुनकर दोबारा कोशिश करें।');
  }
  const maskImage = maskCtx.createImageData(segmentation.width, segmentation.height);
  for (let i = 0; i < segmentation.data.length; i++) {
    const alpha = segmentation.data[i] ? 255 : 0;
    const offset = i * 4;
    maskImage.data[offset] = 255;
    maskImage.data[offset + 1] = 255;
    maskImage.data[offset + 2] = 255;
    maskImage.data[offset + 3] = alpha;
  }
  maskCtx.putImageData(maskImage, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  // Smooth the hard, low-resolution BodyPix mask to reduce jagged white fringes.
  ctx.filter = 'blur(1.25px)';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('AI cutout export failed.')), 'image/png');
  });
}
