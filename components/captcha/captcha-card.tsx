'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import type { Captcha } from '@/lib/captcha.model';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CaptchaCardProps {
  captcha: Captcha;
  onDelete: (id: number) => void;
}

export function CaptchaCard({ captcha, onDelete }: CaptchaCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/captcha/${captcha.id}`);
  };

  const handleDelete = async () => {
    onDelete(captcha.id);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={captcha.imageUrl || '/placeholder.svg'}
            alt={captcha.name}
            fill
            className="object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-semibold truncate">{captcha.name}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{captcha.gridType}</Badge>
            <Badge variant="secondary">#{captcha.id}</Badge>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {captcha.accuracyPercentage}% accuracy
          </span>
          <div className="flex gap-2">
            <Button
              aria-label="Edit captcha"
              variant="outline"
              size="sm"
              onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  aria-label="Delete captcha"
                  variant="outline"
                  size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the captcha.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
