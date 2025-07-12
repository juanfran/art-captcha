import { useState } from 'react';
import type { Captcha } from '@/lib/captcha.model';

export function useCaptchaUI() {
  const [showForm, setShowForm] = useState(false);
  const [editingCaptcha, setEditingCaptcha] = useState<Captcha | null>(null);

  const openCreateForm = () => {
    setEditingCaptcha(null);
    setShowForm(true);
  };

  const openEditForm = (captcha: Captcha) => {
    setEditingCaptcha(captcha);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCaptcha(null);
  };

  const isEditing = !!editingCaptcha;
  const isFormOpen = showForm || isEditing;

  return {
    showForm,
    editingCaptcha,
    isEditing,
    isFormOpen,
    openCreateForm,
    openEditForm,
    closeForm,
  };
}
