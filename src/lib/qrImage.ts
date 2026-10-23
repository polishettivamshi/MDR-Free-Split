import { loadQrDecoder } from './qrDecoder';

type BarcodeDetectorResult = {
  rawValue?: string;
};

type BarcodeDetectorConstructor = {
  new (options: { formats: string[] }): {
    detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
  };
  getSupportedFormats?: () => Promise<string[]>;
};

const MAX_IMAGE_DIMENSION = 1800;

function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).catch(() => loadImageWithElement(file));
  }

  return loadImageWithElement(file);
}

function loadImageWithElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image could not be opened'));
    };
    image.src = objectUrl;
  });
}

function getImageSize(source: ImageBitmap | HTMLImageElement) {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height
    };
  }

  return { width: source.width, height: source.height };
}

function drawToCanvas(source: ImageBitmap | HTMLImageElement): HTMLCanvasElement {
  const { width, height } = getImageSize(source);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is not supported');

  // Transparent QR images would otherwise be read as black-on-black.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  return canvas;
}

async function decodeWithBrowser(source: ImageBitmap | HTMLImageElement): Promise<string | null> {
  const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  if (!BarcodeDetector) return null;

  try {
    if (BarcodeDetector.getSupportedFormats) {
      const formats = await BarcodeDetector.getSupportedFormats();
      if (!formats.includes('qr_code')) return null;
    }

    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const codes = await detector.detect(source);
    const rawValue = codes.find((code) => code.rawValue?.trim())?.rawValue;
    return rawValue?.trim() || null;
  } catch {
    // Fall through to the bundled decoder.
    return null;
  }
}

/**
 * Decode a QR code from an uploaded image.
 *
 * Tries the browser's native BarcodeDetector first and falls back to jsQR.
 * Returns null when the image opens but contains no readable QR code.
 */
export async function decodeQrFromImage(file: File): Promise<string | null> {
  const source = await loadImage(file);

  try {
    const nativeResult = await decodeWithBrowser(source);
    if (nativeResult) return nativeResult;

    const canvas = drawToCanvas(source);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas is not supported');

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const jsQR = await loadQrDecoder();
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    return code?.data?.trim() || null;
  } finally {
    if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
      source.close();
    }
  }
}
