'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { CaptchaForm } from '@/components/captcha-form';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/layout';
import type { CaptchaFormValues } from '@/lib/captcha.model';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCaptcha } from '@/lib/api/captchas';
import { toast } from 'sonner';

export default function NewCaptchaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: createCaptcha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captchas'] });
    },
  });

  const handleCreateCaptcha = (data: Omit<CaptchaFormValues, 'createdBy'>) => {
    const captchaData: CaptchaFormValues = {
      ...data,
      createdBy: session?.user?.email || '',
    };

    add.mutate(captchaData, {
      onSuccess: () => {
        toast.success('Captcha created successfully!');
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
        <LoadingSpinner />
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
          isLoading={add.isPending}
        />
      </div>
    </div>
  );
}
