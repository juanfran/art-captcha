import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import {
  compressImage,
  dataUrlToBuffer,
  bufferToDataUrl,
  getImageMetadata,
  validateImageBuffer,
} from '@/lib/image-compression';
import {
  validateDataUrl,
  validateImageWithMetadata,
  MAX_FILE_SIZE,
} from '@/lib/image-validation';

export const runtime = 'nodejs';

interface UploadImageRequest {
  imageData: string; // data URL
  compressionOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body: UploadImageRequest;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { imageData, compressionOptions } = body;

    if (!imageData) {
      return Response.json(
        { error: 'No image data provided' },
        { status: 400 },
      );
    }

    // Validate data URL format
    const validation = validateDataUrl(imageData);
    if (!validation.isValid) {
      return Response.json(
        {
          error: 'Invalid image data',
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    // Convert data URL to buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = dataUrlToBuffer(imageData);
    } catch {
      return Response.json(
        { error: 'Failed to process image data' },
        { status: 400 },
      );
    }

    // Validate that it's actually an image
    const isValidImage = await validateImageBuffer(imageBuffer);
    if (!isValidImage) {
      return Response.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Get image metadata for validation
    const metadata = await getImageMetadata(imageBuffer);
    const metadataValidation = validateImageWithMetadata(imageBuffer, metadata);

    if (!metadataValidation.isValid) {
      return Response.json(
        {
          error: 'Image validation failed',
          details: metadataValidation.errors,
        },
        { status: 400 },
      );
    }

    // Compress the image
    const compressedBuffer = await compressImage(
      imageBuffer,
      compressionOptions,
    );

    // Get compressed image metadata for response
    const compressedMetadata = await getImageMetadata(compressedBuffer);

    // Convert back to data URL
    const compressedDataUrl = bufferToDataUrl(
      compressedBuffer,
      `image/${compressionOptions?.format || 'jpeg'}`,
    );

    // Calculate compression ratio
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(1);

    return Response.json({
      success: true,
      compressedImageUrl: compressedDataUrl,
      metadata: {
        original: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: originalSize,
          sizeFormatted: formatBytes(originalSize),
        },
        compressed: {
          width: compressedMetadata.width,
          height: compressedMetadata.height,
          format: compressedMetadata.format,
          size: compressedSize,
          sizeFormatted: formatBytes(compressedSize),
        },
        compressionRatio: `${compressionRatio}%`,
        savedBytes: originalSize - compressedSize,
        savedBytesFormatted: formatBytes(originalSize - compressedSize),
      },
    });
  } catch (error) {
    console.error('Image upload/compression error:', error);
    return Response.json(
      {
        error: 'Internal server error during image processing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Support form data uploads as well
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Validate image
    const isValidImage = await validateImageBuffer(imageBuffer);
    if (!isValidImage) {
      return Response.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Get compression options from form data
    const maxWidth = formData.get('maxWidth')
      ? Number(formData.get('maxWidth'))
      : undefined;
    const maxHeight = formData.get('maxHeight')
      ? Number(formData.get('maxHeight'))
      : undefined;
    const quality = formData.get('quality')
      ? Number(formData.get('quality'))
      : undefined;
    const format = formData.get('format') as
      | 'jpeg'
      | 'png'
      | 'webp'
      | undefined;

    // Get metadata and validate
    const metadata = await getImageMetadata(imageBuffer);
    const metadataValidation = validateImageWithMetadata(imageBuffer, metadata);

    if (!metadataValidation.isValid) {
      return Response.json(
        {
          error: 'Image validation failed',
          details: metadataValidation.errors,
        },
        { status: 400 },
      );
    }

    // Compress the image
    const compressedBuffer = await compressImage(imageBuffer, {
      maxWidth,
      maxHeight,
      quality,
      format,
    });

    // Get compressed metadata
    const compressedMetadata = await getImageMetadata(compressedBuffer);

    // Convert to data URL
    const compressedDataUrl = bufferToDataUrl(
      compressedBuffer,
      `image/${format || 'jpeg'}`,
    );

    // Calculate compression stats
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(1);

    return Response.json({
      success: true,
      compressedImageUrl: compressedDataUrl,
      metadata: {
        original: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: originalSize,
          sizeFormatted: formatBytes(originalSize),
        },
        compressed: {
          width: compressedMetadata.width,
          height: compressedMetadata.height,
          format: compressedMetadata.format,
          size: compressedSize,
          sizeFormatted: formatBytes(compressedSize),
        },
        compressionRatio: `${compressionRatio}%`,
        savedBytes: originalSize - compressedSize,
        savedBytesFormatted: formatBytes(originalSize - compressedSize),
      },
    });
  } catch (error) {
    console.error('File upload/compression error:', error);
    return Response.json(
      {
        error: 'Internal server error during file processing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
