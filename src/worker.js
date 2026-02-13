// src/worker.js
import { ImagePool } from '@squoosh/lib';

const pool = new ImagePool(1);

self.onmessage = async (e) => {
  const { id, imageData } = e.data;

  try {
    // imageData llega como DataURL (data:image/png;base64,...)
    // Lo convertimos a bytes sin depender de canvas
    const resp = await fetch(imageData);
    const buf = await resp.arrayBuffer();
    const input = new Uint8Array(buf);

    const image = pool.ingestImage(input);
    await image.decode();

    // WebP lossless real (WASM codec)
    await image.encode({
      webp: {
        lossless: 1,
        quality: 100
      }
    });

    const encoded = await image.encodedWith.mimeType('image/webp');
    const outBuf = encoded.binary.buffer;

    // Pasamos el webp como DataURL para no tocar tu main.js
    const blob = new Blob([outBuf], { type: 'image/webp' });
    const webpData = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });

    self.postMessage({
      type: 'complete',
      id,
      webpData,
      size: blob.size
    });
  } catch (err) {
    self.postMessage({
      type: 'error',
      id,
      error: err?.message || String(err)
    });
  }
};
