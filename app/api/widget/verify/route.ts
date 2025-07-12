import { getCaptchaById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { captchaId, selectedCells, sessionToken } = body;

    if (!captchaId || !selectedCells || !sessionToken) {
      return Response.json(
        { error: 'Missing required fields', success: false },
        { status: 400 },
      );
    }

    const captcha = await getCaptchaById(Number.parseInt(captchaId));

    if (!captcha) {
      return Response.json(
        { error: 'Captcha not found', success: false },
        { status: 404 },
      );
    }

    const correctCells = captcha.correctCells as number[];
    const selectedSet = new Set(selectedCells as number[]);
    const correctSet = new Set(correctCells);

    const intersection = new Set(
      [...selectedSet].filter((x: number) => correctSet.has(x)),
    );
    const union = new Set([...selectedSet, ...correctSet]);

    const accuracy = intersection.size / union.size;
    const requiredAccuracy = captcha.accuracyPercentage / 100;

    const success = accuracy >= requiredAccuracy;

    let verificationToken = null;
    if (success) {
      verificationToken = Buffer.from(
        JSON.stringify({
          captchaId,
          timestamp: Date.now(),
          sessionToken,
          verified: true,
        }),
      ).toString('base64');
    }

    return Response.json({
      success,
      accuracy: Math.round(accuracy * 100),
      requiredAccuracy: captcha.accuracyPercentage,
      verificationToken,
      message: success
        ? 'Verification successful'
        : `Verification failed. Required accuracy: ${captcha.accuracyPercentage}%, achieved: ${Math.round(accuracy * 100)}%`,
    });
  } catch (error) {
    console.error('Failed to verify captcha:', error);
    return Response.json(
      { error: 'Failed to verify captcha', success: false },
      { status: 500 },
    );
  }
}
