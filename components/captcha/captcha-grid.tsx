import { CaptchaCard } from './captcha-card';
import type { Captcha, CaptchaFormValues } from '@/lib/captcha.model';
import { AnimatePresence, motion } from 'motion/react';
interface CaptchaGridProps {
  captchas: Captcha[];
  onDelete: (id: number) => void;
}

export function CaptchaGrid({ captchas, onDelete }: CaptchaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {captchas.map((captcha) => (
          <motion.div
            key={captcha.id}
            layout
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}>
            <CaptchaCard
              captcha={captcha}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
