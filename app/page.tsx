'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CaptchaCard } from '@/components/captcha-card';
import { CaptchaForm } from '@/components/captcha-form';
import { Navbar } from '@/components/navbar';
import type {
  Captcha,
  CaptchaFormValues,
  CaptchaUpdateValues,
} from '@/lib/captcha.model';
import { Plus, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const pageSize = 10;

async function fetchCaptchas(
  offset = 0,
  limit = pageSize,
): Promise<{
  captchas: Captcha[];
  hasMore: boolean;
}> {
  const res = await fetch(`/api/captchas?offset=${offset}&limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to fetch captchas');
  }
  const captchas = (await res.json()) as Captcha[];
  return {
    captchas,
    hasMore: captchas.length === limit,
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [editingCaptcha, setEditingCaptcha] = useState<Captcha | null>(null);
  const { ref, inView } = useInView();
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ['captchas', page],
    placeholderData: keepPreviousData,
    queryFn: () => fetchCaptchas(page * pageSize, pageSize),
  });

  const addCaptchaMutation = useMutation({
    mutationFn: (newCaptcha: CaptchaFormValues) =>
      fetch('/api/captchas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaptcha),
      }).then((res) => res.json()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['captchas'] }),
  });

  const updateCaptchaMutation = useMutation({
    mutationFn: (updatedCaptcha: CaptchaUpdateValues) =>
      fetch(`/api/captchas/${updatedCaptcha.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCaptcha),
      }).then((res) => res.json()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['captchas'] }),
  });

  const deleteCaptchaMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/captchas/${id}`, {
        method: 'DELETE',
      }),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['captchas', page] });

      const previousCaptchas = queryClient.getQueryData<{
        captchas: Captcha[];
        hasMore: boolean;
      }>(['captchas', page]);

      queryClient.setQueryData<{
        captchas: Captcha[];
        hasMore: boolean;
      }>(['captchas', page], (old) => {
        if (!old)
          return {
            captchas: [],
            hasMore: false,
          };

        return {
          ...old,
          captchas: old.captchas.filter((captcha) => captcha.id !== id),
        };
      });

      return { previousCaptchas };
    },
    onError: (err, id, context) => {
      if (context?.previousCaptchas) {
        queryClient.setQueryData(['captchas', page], context.previousCaptchas);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['captchas', page] });
    },
  });

  const { mutate, variables, isPending: isAdding } = addCaptchaMutation;

  useEffect(() => {
    if (inView && data?.hasMore && !isPending) {
      setPage((prev) => prev + 1);
    }
  }, [inView, data?.hasMore, isPending]);

  const handleCreateCaptcha = async (data: CaptchaFormValues) => {
    mutate(data);
    setShowForm(false);
  };

  const handleUpdateCaptcha = async (data: Omit<CaptchaUpdateValues, 'id'>) => {
    if (!editingCaptcha) return;

    updateCaptchaMutation.mutate({
      ...data,
      id: editingCaptcha.id,
    });

    setEditingCaptcha(null);
  };

  const handleDeleteCaptcha = (id: number) => {
    deleteCaptchaMutation.mutate(id);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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

  if (showForm || editingCaptcha) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <CaptchaForm
            captcha={editingCaptcha || undefined}
            onSubmit={
              editingCaptcha ? handleUpdateCaptcha : handleCreateCaptcha
            }
            onCancel={() => {
              setShowForm(false);
              setEditingCaptcha(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Captcha Management</h1>
            <p className="text-muted-foreground">
              Manage your captcha collection
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Captcha
          </Button>
        </div>

        {data?.captchas.length === 0 && !isPending && !isAdding ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No captchas found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first captcha
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isAdding && variables && (
              <CaptchaCard
                key={'new-captcha'}
                captcha={variables}
                onEdit={setEditingCaptcha}
                onDelete={handleDeleteCaptcha}
              />
            )}

            {data?.captchas.map((captcha) => (
              <CaptchaCard
                key={captcha.id}
                captcha={captcha}
                onEdit={setEditingCaptcha}
                onDelete={handleDeleteCaptcha}
              />
            ))}
          </div>
        )}

        {data?.hasMore && (
          <div
            ref={ref}
            className="flex justify-center py-8">
            {isPending && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );
}
