import { auth } from '@/auth';
import { getCaptchaById, updateCaptcha, deleteCaptcha } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const captcha = await getCaptchaById(Number.parseInt(params.id));
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
    const captcha = await updateCaptcha(Number.parseInt(id), body);
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
