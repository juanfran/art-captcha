'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    ArtCaptcha?: {
      init: (
        selector: string,
        options: {
          onSuccess: (token: string) => void;
          onError: (error: { message?: string }) => void;
          onReset: () => void;
        },
      ) => void;
    };
  }
}

function WidgetPreviewContent() {
  const searchParams = useSearchParams();
  const captchaId = searchParams.get('id');
  const theme = searchParams.get('theme') || 'light';
  const size = searchParams.get('size') || 'normal';

  useEffect(() => {
    if (!captchaId) return;

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_AUTH_URL
        : 'http://localhost:3000';

    const scriptUrl = `${baseUrl}/api/widget/script?id=${captchaId}&theme=${theme}&size=${size}`;

    // Load the widget script dynamically
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      console.log('Art Captcha widget loaded');

      // Initialize the widget
      if (window.ArtCaptcha) {
        window.ArtCaptcha.init('#art-captcha-container', {
          onSuccess: function (token: string) {
            console.log('✅ Captcha verified!', token);
            alert('Captcha verification successful!');
          },
          onError: function (error: { message?: string }) {
            console.log('❌ Captcha failed:', error);
          },
          onReset: function () {
            console.log('🔄 Captcha reset');
          },
        });
      }
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [captchaId, theme, size]);

  if (!captchaId) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No captcha ID provided</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div
        id="art-captcha-container"
        data-art-captcha={captchaId}></div>
    </div>
  );
}

export default function WidgetPreviewPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading preview...</div>}>
      <WidgetPreviewContent />
    </Suspense>
  );
}
