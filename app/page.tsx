'use client';

import { useSession, signIn } from 'next-auth/react';
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
import { CaptchaGrid } from '@/components/captcha';
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  InfiniteScrollTrigger,
} from '@/components/layout';
import { useCaptchas } from '@/hooks/useCaptchas';
import { useCaptchaUI } from '@/hooks/useCaptchaUI';
import type {
  CaptchaFormValues,
  CaptchaUpdateValues,
} from '@/lib/captcha.model';

export default function Home() {
  const { data: session, status } = useSession();
  const {
    captchas,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    add,
    update,
    remove,
  } = useCaptchas();

  const {
    editingCaptcha,
    isFormOpen,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useCaptchaUI();

  const handleCreateCaptcha = (data: CaptchaFormValues) => {
    add.mutate(data);
    closeForm();
  };

  const handleUpdateCaptcha = (data: Omit<CaptchaUpdateValues, 'id'>) => {
    if (!editingCaptcha) return;

    update.mutate({
      ...data,
      id: editingCaptcha.id,
    });

    closeForm();
  };

  const handleFormSubmit = (data: any) => {
    if (editingCaptcha) {
      handleUpdateCaptcha(data);
    } else {
      handleCreateCaptcha(data);
    }
  };

  const handleDeleteCaptcha = (id: number) => {
    remove.mutate(id);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Art Captcha CMS</CardTitle>
            <CardDescription>
              Sign in with Google to manage your captchas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn('google')}
              className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <CaptchaForm
            captcha={editingCaptcha || undefined}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-destructive mb-4">
                Error loading captchas: {error.message}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 mx-auto">
        <PageHeader
          title="Captcha Management"
          description="Manage your captcha collection"
          onNew={openCreateForm}
        />

        {captchas.length === 0 && !isLoading && !add.isPending ? (
          <EmptyState
            title="No captchas found"
            description="Create your first captcha to get started"
            actionLabel="Create your first captcha"
            onAction={openCreateForm}
          />
        ) : (
          <>
            <CaptchaGrid
              captchas={captchas}
              optimisticCaptcha={add.isPending ? add.variables : undefined}
              onEdit={openEditForm}
              onDelete={handleDeleteCaptcha}
            />

            <InfiniteScrollTrigger
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
