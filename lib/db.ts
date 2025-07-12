import { db } from '../db/index';
import { captchas } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CaptchaFormValues, CaptchaUpdateValues } from './captcha.model';

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

export async function createCaptcha(captcha: CaptchaFormValues) {
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

export async function updateCaptcha(id: number, captcha: CaptchaUpdateValues) {
  const [updated] = await db
    .update(captchas)
    .set({
      ...captcha,
      updatedAt: new Date(),
    })
    .where(eq(captchas.id, id))
    .returning();
  return updated;
}

export async function deleteCaptcha(id: number): Promise<void> {
  await db.delete(captchas).where(eq(captchas.id, id));
}
