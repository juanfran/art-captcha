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
import { Navbar } from '@/components/navbar';
import { CaptchaGrid } from '@/components/captcha';
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  InfiniteScrollTrigger,
} from '@/components/layout';
import { useCaptchas } from '@/hooks/useCaptchas';
import { startTransition } from 'react';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  const {
    captchas,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    remove,
  } = useCaptchas(20, status === 'authenticated');

  const handleDeleteCaptcha = (id: number) => {
    startTransition(() => {
      remove.mutate(id);
    });
  };

  if (isLoading || status === 'loading') {
    return Loading();
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
        />

        {captchas.length === 0 && !isLoading ? (
          <EmptyState
            title="No captchas found"
            description="Create your first captcha to get started"
            actionLabel="Create your first captcha"
          />
        ) : (
          <>
            <CaptchaGrid
              captchas={captchas}
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
