'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const router = useRouter();

  const handleNewCaptcha = () => {
    router.push('/new');
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <Button onClick={handleNewCaptcha}>
        <Plus className="h-4 w-4 mr-2" />
        New Captcha
      </Button>
    </div>
  );
}
