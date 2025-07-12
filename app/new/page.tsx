'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CaptchaForm } from '@/components/captcha-form';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/layout';
import { useCaptchas } from '@/hooks/useCaptchas';
import type { CaptchaFormValues } from '@/lib/captcha.model';

export default function NewCaptchaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { add } = useCaptchas();

  const handleCreateCaptcha = (data: Omit<CaptchaFormValues, 'createdBy'>) => {
    const captchaData: CaptchaFormValues = {
      ...data,
      createdBy: session?.user?.email || '',
    };

    add.mutate(captchaData, {
      onSuccess: () => {
        router.push('/');
      },
      onError: (error) => {
        console.error('Failed to create captcha:', error);
      },
    });
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <CaptchaForm
          onSubmit={handleCreateCaptcha}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
