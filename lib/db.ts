import { db } from '../db/index';
import { captchas } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface Captcha {
  id: number;
  name: string;
  imageUrl: string;
  accuracyPercentage: number;
  gridType: string;
  correctCells: number[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export async function getCaptchas(offset = 0, limit = 10) {
  return await db
    .select()
    .from(captchas)
    .orderBy(desc(captchas.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCaptchaById(id: number) {
  const result = await db.select().from(captchas).where(eq(captchas.id, id));
  return result[0] || null;
}

export async function createCaptcha(
  captcha: Omit<Captcha, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const [inserted] = await db
    .insert(captchas)
    .values({
      name: captcha.name,
      imageUrl: captcha.imageUrl,
      accuracyPercentage: captcha.accuracyPercentage,
      gridType: captcha.gridType,
      correctCells: captcha.correctCells,
      createdBy: captcha.createdBy,
    })
    .returning();

  return inserted;
}

export async function updateCaptcha(
  id: number,
  captcha: Partial<Omit<Captcha, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const [updated] = await db
    .update(captchas)
    .set({
      ...(captcha.name && { name: captcha.name }),
      ...(captcha.imageUrl && { imageUrl: captcha.imageUrl }),
      ...(captcha.accuracyPercentage !== undefined && {
        accuracyPercentage: captcha.accuracyPercentage,
      }),
      ...(captcha.gridType && { gridType: captcha.gridType }),
      ...(captcha.correctCells && { correctCells: captcha.correctCells }),
      updatedAt: new Date(),
    })
    .where(eq(captchas.id, id))
    .returning();
  return updated;
}

export async function deleteCaptcha(id: number): Promise<void> {
  await db.delete(captchas).where(eq(captchas.id, id));
}
