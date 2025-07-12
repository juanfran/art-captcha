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
  onDelete: (id: number) => void;
}

export function CaptchaGrid({
  captchas,
  optimisticCaptcha,
  onDelete,
}: CaptchaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {optimisticCaptcha && (
        <CaptchaCard
          key="optimistic-captcha"
          captcha={optimisticCaptcha as Captcha}
          onDelete={onDelete}
        />
      )}

      {captchas.map((captcha) => (
        <CaptchaCard
          key={captcha.id}
          captcha={captcha}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
