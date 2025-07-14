import { auth } from '@/auth';
import { getCaptchaById, updateCaptcha, deleteCaptcha } from '@/lib/db';
import {
  compressImage,
  dataUrlToBuffer,
  bufferToDataUrl,
  validateImageBuffer,
} from '@/lib/image-compression';
import { validateDataUrl } from '@/lib/image-validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const captcha = await getCaptchaById(Number.parseInt(id));
    if (!captcha) {
      return Response.json({ error: 'Captcha not found' }, { status: 404 });
    }
    return Response.json(captcha);
  } catch (error) {
    console.error('Failed to fetch captcha:', error);
    return Response.json({ error: 'Failed to fetch captcha' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = await params;
    let processedImageUrl = body.imageUrl;

    // If imageUrl is a data URL, compress it
    if (body.imageUrl && body.imageUrl.startsWith('data:')) {
      try {
        // Validate the data URL
        const validation = validateDataUrl(body.imageUrl);
        if (!validation.isValid) {
          return Response.json(
            {
              error: 'Invalid image data',
              details: validation.errors,
            },
            { status: 400 },
          );
        }

        // Convert and compress
        const imageBuffer = dataUrlToBuffer(body.imageUrl);

        // Validate it's a real image
        const isValid = await validateImageBuffer(imageBuffer);
        if (!isValid) {
          return Response.json(
            { error: 'Invalid image format' },
            { status: 400 },
          );
        }

        // Compress the image
        const compressedBuffer = await compressImage(imageBuffer, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 85,
          format: 'jpeg',
        });

        // Convert back to data URL
        processedImageUrl = bufferToDataUrl(compressedBuffer, 'image/jpeg');

        console.log(
          `Image compressed during update: ${imageBuffer.length} → ${compressedBuffer.length} bytes`,
        );
      } catch (error) {
        console.error('Image compression error during update:', error);
        return Response.json(
          { error: 'Failed to process image' },
          { status: 400 },
        );
      }
    }

    const captcha = await updateCaptcha(Number.parseInt(id), {
      ...body,
      imageUrl: processedImageUrl,
    });
    return Response.json(captcha);
  } catch (error) {
    console.error('Failed to update captcha:', error);
    return Response.json(
      { error: 'Failed to update captcha' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteCaptcha(Number.parseInt(id));
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete captcha:', error);
    return Response.json(
      { error: 'Failed to delete captcha' },
      { status: 500 },
    );
  }
}
