export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { verificationToken, sessionToken } = body;

    if (!verificationToken || !sessionToken) {
      return Response.json(
        {
          valid: false,
          error: 'Missing required fields',
          message: 'Both verificationToken and sessionToken are required',
        },
        { status: 400 },
      );
    }

    try {
      const decodedToken = JSON.parse(
        Buffer.from(verificationToken, 'base64').toString('utf-8'),
      );

      const now = Date.now();
      const tokenTimestamp = decodedToken.timestamp;
      const maxAge = 10 * 60 * 1000; // 10 minutes

      if (now - tokenTimestamp > maxAge) {
        return Response.json({
          valid: false,
          error: 'Token expired',
          message:
            'Verification token has expired. Please complete the captcha again.',
        });
      }

      if (decodedToken.sessionToken !== sessionToken) {
        return Response.json({
          valid: false,
          error: 'Invalid session',
          message: 'Session token mismatch. Please complete the captcha again.',
        });
      }

      if (!decodedToken.verified) {
        return Response.json({
          valid: false,
          error: 'Not verified',
          message: 'Token is not marked as verified.',
        });
      }

      return Response.json({
        valid: true,
        captchaId: decodedToken.captchaId,
        timestamp: decodedToken.timestamp,
        message: 'Token is valid',
      });
    } catch {
      return Response.json({
        valid: false,
        error: 'Invalid token format',
        message: 'Unable to decode verification token.',
      });
    }
  } catch (error) {
    console.error('Failed to validate token:', error);
    return Response.json(
      {
        valid: false,
        error: 'Server error',
        message: 'Internal server error during token validation',
      },
      { status: 500 },
    );
  }
}
