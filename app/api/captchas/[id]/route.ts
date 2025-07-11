import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCaptchaById, updateCaptcha, deleteCaptcha } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const captcha = await getCaptchaById(Number.parseInt(params.id));
    if (!captcha) {
      return NextResponse.json({ error: 'Captcha not found' }, { status: 404 });
    }
    return NextResponse.json(captcha);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch captcha' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const captcha = await updateCaptcha(Number.parseInt(params.id), body);
    return NextResponse.json(captcha);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update captcha' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteCaptcha(Number.parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete captcha' },
      { status: 500 },
    );
  }
}
