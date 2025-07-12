import type {
  Captcha,
  CaptchaFormValues,
  CaptchaUpdateValues,
} from '@/lib/captcha.model';

export interface FetchCaptchasResponse {
  captchas: Captcha[];
  hasMore: boolean;
  nextOffset?: number;
}

export async function fetchCaptchas(
  offset = 0,
  limit = 10,
): Promise<FetchCaptchasResponse> {
  const res = await fetch(`/api/captchas?offset=${offset}&limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to fetch captchas');
  }
  const captchas = (await res.json()) as Captcha[];
  return {
    captchas,
    hasMore: captchas.length === limit,
    nextOffset: captchas.length === limit ? offset + limit : undefined,
  };
}

export async function fetchCaptchaById(id: number): Promise<Captcha> {
  const res = await fetch(`/api/captchas/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch captcha');
  }
  return res.json();
}

export async function createCaptcha(data: CaptchaFormValues): Promise<Captcha> {
  const res = await fetch('/api/captchas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create captcha');
  }

  return res.json();
}

export async function updateCaptcha(
  data: CaptchaUpdateValues,
): Promise<Captcha> {
  const res = await fetch(`/api/captchas/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update captcha');
  }

  return res.json();
}

export async function deleteCaptcha(id: number): Promise<void> {
  const res = await fetch(`/api/captchas/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete captcha');
  }
}
