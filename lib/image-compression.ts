import sharp from 'sharp';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const DEFAULT_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  format: 'jpeg',
};

/**
 * Compresses an image buffer using Sharp
 * @param buffer - The image buffer to compress
 * @param options - Compression options
 * @returns Compressed image buffer
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageCompressionOptions = {},
): Promise<Buffer> {
  const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

  try {
    let sharpInstance = sharp(buffer);

    // Get image metadata to check current dimensions
    const metadata = await sharpInstance.metadata();

    // Only resize if the image is larger than the max dimensions
    if (
      (opts.maxWidth && metadata.width && metadata.width > opts.maxWidth) ||
      (opts.maxHeight && metadata.height && metadata.height > opts.maxHeight)
    ) {
      sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format and quality
    switch (opts.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: opts.quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: opts.quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: opts.quality });
        break;
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Converts a data URL to a buffer
 * @param dataUrl - The data URL string
 * @returns Buffer containing the image data
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }

  const [, data] = dataUrl.split(',');
  if (!data) {
    throw new Error('Invalid data URL: missing data part');
  }

  return Buffer.from(data, 'base64');
}

/**
 * Converts a buffer to a data URL
 * @param buffer - The image buffer
 * @param mimeType - The MIME type (default: image/jpeg)
 * @returns Data URL string
 */
export function bufferToDataUrl(
  buffer: Buffer,
  mimeType: string = 'image/jpeg',
): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validates that a buffer contains a valid image
 * @param buffer - The buffer to validate
 * @returns Promise<boolean> - True if valid image
 */
export async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.width && metadata.height && metadata.format);
  } catch {
    return false;
  }
}

/**
 * Gets image metadata
 * @param buffer - The image buffer
 * @returns Image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  try {
    return await sharp(buffer).metadata();
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
}
