import { CaptchaCard } from './captcha-card';
import type { Captcha, CaptchaFormValues } from '@/lib/captcha.model';

// Temporary type for optimistic updates
type OptimisticCaptcha = CaptchaFormValues & {
  id?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

interface CaptchaGridProps {
  captchas: Captcha[];
  optimisticCaptcha?: OptimisticCaptcha;
  onEdit: (captcha: Captcha) => void;
  onDelete: (id: number) => void;
}

export function CaptchaGrid({
  captchas,
  optimisticCaptcha,
  onEdit,
  onDelete,
}: CaptchaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {optimisticCaptcha && (
        <CaptchaCard
          key="optimistic-captcha"
          captcha={optimisticCaptcha as Captcha}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {captchas.map((captcha) => (
        <CaptchaCard
          key={captcha.id}
          captcha={captcha}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
