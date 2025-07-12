'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CaptchaForm } from '@/components/captcha-form';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/layout';
import { fetchCaptchaById, updateCaptcha } from '@/lib/api/captchas';
import type { CaptchaFormValues } from '@/lib/captcha.model';
import { use } from 'react';
import { toast } from 'sonner';

interface EditCaptchaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCaptchaPage({ params }: EditCaptchaPageProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = use(params);
  const captchaId = parseInt(id);

  const update = useMutation({
    mutationFn: updateCaptcha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captchas'] });
    },
  });

  const {
    data: captcha,
    isLoading: isCaptchaLoading,
    error,
  } = useQuery({
    queryKey: ['captcha', captchaId],
    queryFn: () => fetchCaptchaById(captchaId),
    enabled: !!captchaId && status === 'authenticated',
  });

  const handleUpdateCaptcha = (data: Omit<CaptchaFormValues, 'createdBy'>) => {
    if (!captcha) return;

    const updateData = {
      id: captcha.id,
      ...data,
    };

    update.mutate(updateData, {
      onSuccess: () => {
        toast.success('Captcha updated successfully!');
        router.push('/');
      },
      onError: (error) => {
        console.error('Failed to update captcha:', error);
      },
    });
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (status === 'loading' || isCaptchaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-destructive mb-4">
                Error loading captcha: {error.message}
              </p>
              <Button onClick={() => router.push('/')}>Go Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!captcha) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <p className="mb-4">Captcha not found</p>
              <Button onClick={() => router.push('/')}>Go Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <CaptchaForm
          captcha={captcha}
          onSubmit={handleUpdateCaptcha}
          onCancel={handleCancel}
          isLoading={update.isPending}
        />
      </div>
    </div>
  );
}
