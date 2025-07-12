import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onNew: () => void;
}

export function PageHeader({ title, description, onNew }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <Button onClick={onNew}>
        <Plus className="h-4 w-4 mr-2" />
        New Captcha
      </Button>
    </div>
  );
}
