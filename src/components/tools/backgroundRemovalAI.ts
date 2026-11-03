import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

let segmenterPromise: Promise<bodySegmentation.BodySegmenter> | null = null;
const getSegmenter = () => {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      return bodySegmentation.createSegmenter(bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation, {
        runtime: 'mediapipe', modelType: 'general',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
      });
    })().catch((error) => { segmenterPromise = null; throw error; });
  }
  return segmenterPromise;
};

export async function removeBackgroundAI(source: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image could not be loaded for AI processing.'));
    img.src = source;
  });
  const segmenter = await getSegmenter();
  const people = await segmenter.segmentPeople(image, { multiSegmentation: false, segmentBodyParts: false });
  if (!people.length) throw new Error('AI could not detect a person. Try a clear, front-facing photo.');
  const mask = await bodySegmentation.toBinaryMask(people[0], { r: 255, g: 255, b: 255, a: 255 }, { r: 0, g: 0, b: 0, a: 0 }, false, 0.5);
  const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.drawImage(image, 0, 0);
  const maskCanvas = document.createElement('canvas'); maskCanvas.width = mask.width; maskCanvas.height = mask.height;
  const maskCtx = maskCanvas.getContext('2d'); if (!maskCtx) throw new Error('AI mask could not be created.');
  maskCtx.putImageData(mask, 0, 0); ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height); ctx.globalCompositeOperation = 'source-over';
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('AI cutout export failed.')), 'image/png'));
}
