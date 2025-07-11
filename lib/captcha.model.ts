export interface Captcha {
  id: number;
  name: string;
  imageUrl: string;
  accuracyPercentage: number;
  gridType: string;
  correctCells: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
}

export interface CaptchaFormValues
  extends Omit<Captcha, 'id' | 'createdAt' | 'updatedAt'> {}

export interface CaptchaUpdateValues
  extends Partial<Omit<Captcha, 'id' | 'createdAt' | 'updatedAt'>> {
  id: Captcha['id'];
}
