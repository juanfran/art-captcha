'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
}

export function EmptyState({
  title = 'No captchas found',
  description = 'Create your first captcha to get started',
  actionLabel = 'Create your first captcha',
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = () => {
    router.push('/new');
  };

  return (
    <Card className="text-center py-12">
      <CardContent>
        <p className="text-muted-foreground mb-4">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <Button onClick={handleAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
