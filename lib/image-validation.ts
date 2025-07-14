/**
 * Image validation utilities for server-side validation
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_DIMENSIONS = { width: 200, height: 200 };
export const MAX_DIMENSIONS = { width: 4000, height: 4000 };

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

/**
 * Validates image file type from MIME type
 * @param mimeType - The MIME type to validate
 * @returns boolean - True if valid image type
 */
export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(
    mimeType as (typeof ALLOWED_IMAGE_TYPES)[number],
  );
}

/**
 * Validates image file size
 * @param size - File size in bytes
 * @returns boolean - True if within allowed size
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Validates image dimensions
 * @param width - Image width
 * @param height - Image height
 * @returns boolean - True if within allowed dimensions
 */
export function isValidDimensions(width: number, height: number): boolean {
  return (
    width >= MIN_DIMENSIONS.width &&
    height >= MIN_DIMENSIONS.height &&
    width <= MAX_DIMENSIONS.width &&
    height <= MAX_DIMENSIONS.height
  );
}

/**
 * Extracts MIME type from data URL
 * @param dataUrl - The data URL
 * @returns string - The MIME type
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : '';
}

/**
 * Validates a data URL image
 * @param dataUrl - The data URL to validate
 * @returns ImageValidationResult
 */
export function validateDataUrl(
  dataUrl: string,
): Pick<ImageValidationResult, 'isValid' | 'errors'> {
  const errors: string[] = [];

  // Check if it's a valid data URL
  if (!dataUrl.startsWith('data:')) {
    errors.push('Invalid data URL format');
    return { isValid: false, errors };
  }

  // Extract and validate MIME type
  const mimeType = getMimeTypeFromDataUrl(dataUrl);
  if (!mimeType) {
    errors.push('Could not determine image type');
  } else if (!isValidImageType(mimeType)) {
    errors.push(
      `Unsupported image type: ${mimeType}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }

  // Estimate file size from base64 data
  const [, base64Data] = dataUrl.split(',');
  if (base64Data) {
    const estimatedSize = (base64Data.length * 3) / 4; // Rough base64 to bytes conversion
    if (!isValidFileSize(estimatedSize)) {
      errors.push(
        `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an uploaded file
 * @param file - The uploaded file
 * @returns Pick<ImageValidationResult, 'isValid' | 'errors'>
 */
export function validateUploadedFile(
  file: File,
): Pick<ImageValidationResult, 'isValid' | 'errors'> {
  const errors: string[] = [];

  // Validate file type
  if (!isValidImageType(file.type)) {
    errors.push(
      `Unsupported image type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }

  // Validate file size
  if (!isValidFileSize(file.size)) {
    errors.push(
      `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates image buffer with metadata
 * @param buffer - The image buffer
 * @param metadata - Sharp metadata object
 * @returns ImageValidationResult
 */
export function validateImageWithMetadata(
  buffer: Buffer,
  metadata: { width?: number; height?: number; format?: string },
): ImageValidationResult {
  const errors: string[] = [];

  // Validate dimensions
  if (!metadata.width || !metadata.height) {
    errors.push('Could not determine image dimensions');
  } else if (!isValidDimensions(metadata.width, metadata.height)) {
    errors.push(
      `Invalid dimensions: ${metadata.width}x${metadata.height}. ` +
        `Minimum: ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}, ` +
        `Maximum: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}`,
    );
  }

  // Validate format
  if (!metadata.format) {
    errors.push('Could not determine image format');
  } else {
    const mimeType = `image/${metadata.format}`;
    if (!isValidImageType(mimeType)) {
      errors.push(`Unsupported image format: ${metadata.format}`);
    }
  }

  // Validate buffer size
  if (!isValidFileSize(buffer.length)) {
    errors.push(
      `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    metadata:
      metadata.width && metadata.height && metadata.format
        ? {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length,
          }
        : undefined,
  };
}
