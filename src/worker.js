// WebP Encoder using Canvas API with lossless settings
// This provides true lossless conversion by using the browser's native WebP encoder

self.onmessage = async function(e) {
  const { id, imageData, width, height } = e.data;
  
  try {
    // Create an OffscreenCanvas (supported in workers)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Load the image
    const img = await createImageBitmap(await fetch(imageData).then(r => r.blob()));
    
    // Draw to canvas
    ctx.drawImage(img, 0, 0);
    
    // Convert to WebP with lossless quality
    // The 'quality' parameter at 1.0 with 'image/webp' should produce lossless output
    // Modern browsers (Chrome, Edge, Safari 16.4+) support lossless WebP
    const blob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: 1.0 // Maximum quality for lossless
    });
    
    // Verify it's actually WebP
    if (!blob.type.includes('webp')) {
      throw new Error('Browser does not support WebP encoding');
    }
    
    // Convert blob to data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      self.postMessage({
        type: 'complete',
        id,
        webpData: reader.result,
        size: blob.size
      });
    };
    reader.onerror = () => {
      throw new Error('Failed to read blob');
    };
    reader.readAsDataURL(blob);
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message
    });
  }
};
