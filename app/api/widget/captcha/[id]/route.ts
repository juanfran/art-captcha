import { getCaptchaById } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const captcha = await getCaptchaById(Number.parseInt(id));

    if (!captcha) {
      return Response.json({ error: 'Captcha not found' }, { status: 404 });
    }

    const publicCaptcha = {
      id: captcha.id,
      name: captcha.name,
      imageUrl: captcha.imageUrl,
      gridType: captcha.gridType,
      accuracyPercentage: captcha.accuracyPercentage,
    };

    return Response.json(publicCaptcha);
  } catch (error) {
    console.error('Failed to fetch captcha:', error);
    return Response.json({ error: 'Failed to fetch captcha' }, { status: 500 });
  }
}
