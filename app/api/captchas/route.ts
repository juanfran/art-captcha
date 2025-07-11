import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCaptchas, createCaptcha } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth(request);

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
    return Response.json(
      { error: 'Failed to fetch captchas' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth(request);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const captcha = await createCaptcha({
      ...body,
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
