"use client";

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
import type { Captcha } from '@/lib/db';
import { Plus, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const { data: session, status } = useSession();
  const [captchas, setCaptchas] = useState<Captcha[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCaptcha, setEditingCaptcha] = useState<Captcha | null>(null);
  const { ref, inView } = useInView();

  const loadCaptchas = useCallback(
    async (offset = 0, reset = false) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/captchas?offset=${offset}&limit=10`);
        const newCaptchas = await response.json();

        console.log('Loaded captchas:', newCaptchas);

        if (newCaptchas.length < 10) {
          setHasMore(false);
        }

        setCaptchas((prev) =>
          reset ? newCaptchas : [...prev, ...newCaptchas],
        );
      } catch (error) {
        console.error('Failed to load captchas:', error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore],
  );

  useEffect(() => {
    if (session) {
      loadCaptchas(0, true);
    }
  }, [session]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadCaptchas(captchas.length);
    }
  }, [inView, hasMore, loading, captchas.length, loadCaptchas]);

  const handleCreateCaptcha = async (data: any) => {
    try {
      const response = await fetch('/api/captchas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const newCaptcha = await response.json();
      setCaptchas((prev) => [newCaptcha, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create captcha:', error);
    }
  };

  const handleUpdateCaptcha = async (data: any) => {
    if (!editingCaptcha) return;

    try {
      const response = await fetch(`/api/captchas/${editingCaptcha.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updatedCaptcha = await response.json();
      setCaptchas((prev) =>
        prev.map((c) => (c.id === updatedCaptcha.id ? updatedCaptcha : c)),
      );
      setEditingCaptcha(null);
    } catch (error) {
      console.error('Failed to update captcha:', error);
    }
  };

  const handleDeleteCaptcha = (id: number) => {
    setCaptchas((prev) => prev.filter((c) => c.id !== id));
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
            <CardTitle className="text-2xl">Captcha CMS</CardTitle>
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
        <div className="container py-8">
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
      <div className="container py-8">
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

        {captchas.length === 0 && !loading ? (
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
            {captchas.map((captcha) => (
              <CaptchaCard
                key={captcha.id}
                captcha={captcha}
                onEdit={setEditingCaptcha}
                onDelete={handleDeleteCaptcha}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div
            ref={ref}
            className="flex justify-center py-8">
            {loading && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );
}
