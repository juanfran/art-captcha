'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCaptchas } from './useCaptchas';
import { useCaptchaUI } from './useCaptchaUI';

interface CaptchaContextType {
  captchas: ReturnType<typeof useCaptchas>;
  ui: ReturnType<typeof useCaptchaUI>;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

interface CaptchaProviderProps {
  children: ReactNode;
}

export function CaptchaProvider({ children }: CaptchaProviderProps) {
  const captchas = useCaptchas();
  const ui = useCaptchaUI();

  return (
    <CaptchaContext.Provider value={{ captchas, ui }}>
      {children}
    </CaptchaContext.Provider>
  );
}

export function useCaptchaContext() {
  const context = useContext(CaptchaContext);
  if (context === undefined) {
    throw new Error('useCaptchaContext must be used within a CaptchaProvider');
  }
  return context;
}
