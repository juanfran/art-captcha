import { auth } from '@/auth';
import { getCaptchas, createCaptcha } from '@/lib/db';
import {
  compressImage,
  dataUrlToBuffer,
  bufferToDataUrl,
  validateImageBuffer,
} from '@/lib/image-compression';
import { validateDataUrl } from '@/lib/image-validation';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Number.parseInt(searchParams.get('offset') || '0');
  const limit = Number.parseInt(searchParams.get('limit') || '10');

  try {
    const captchas = await getCaptchas(offset, limit);
    return Response.json(captchas);
  } catch (error) {
    console.error('Failed to fetch captchas:', error);
    return Response.json(
      { error: 'Failed to fetch captchas' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
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
          `Image compressed: ${imageBuffer.length} → ${compressedBuffer.length} bytes`,
        );
      } catch (error) {
        console.error('Image compression error:', error);
        return Response.json(
          { error: 'Failed to process image' },
          { status: 400 },
        );
      }
    }

    const captcha = await createCaptcha({
      ...body,
      imageUrl: processedImageUrl,
      createdBy: session.user?.email || '',
    });
    return Response.json(captcha);
  } catch (error) {
    console.error('Failed to create captcha:', error);
    return Response.json(
      { error: 'Failed to create captcha' },
      { status: 500 },
    );
  }
}
