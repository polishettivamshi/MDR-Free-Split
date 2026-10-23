type JsQrDecoder = typeof import('jsqr').default;

let decoderPromise: Promise<JsQrDecoder> | null = null;

/**
 * Load the jsQR decoder on demand.
 *
 * The decoder is only needed when a camera or uploaded image is actually
 * scanned, so keeping it out of the initial bundle makes first paint lighter.
 * A single promise is shared by every caller so the chunk is fetched once.
 */
export const loadQrDecoder = (): Promise<JsQrDecoder> => {
  if (!decoderPromise) {
    decoderPromise = import('jsqr')
      .then((module) => module.default)
      .catch((error) => {
        // Allow a later retry if the network/chunk load failed.
        decoderPromise = null;
        throw error;
      });
  }

  return decoderPromise;
};
