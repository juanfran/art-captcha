'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GridSelector } from '@/components/grid-selector';
import type {
  Captcha,
  CaptchaFormValues,
  CaptchaUpdateValues,
} from '@/lib/captcha.model';
import { Upload } from 'lucide-react';

interface CaptchaFormProps {
  captcha?: Captcha;
  onSubmit: (data: Omit<CaptchaUpdateValues, 'id'> | CaptchaFormValues) => void;
  onCancel: () => void;
}

const GRID_TYPES = ['3x3', '3x4', '4x3', '4x4', '5x5'];

export function CaptchaForm({ captcha, onSubmit, onCancel }: CaptchaFormProps) {
  const [formData, setFormData] = useState({
    name: captcha?.name || '',
    accuracyPercentage: captcha?.accuracyPercentage || 80,
    gridType: captcha?.gridType || '3x3',
    imageUrl: captcha?.imageUrl || '',
    correctCells: captcha?.correctCells || ([] as number[]),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{captcha ? 'Edit Captcha' : 'Create New Captcha'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter captcha name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accuracy">Accuracy Percentage</Label>
            <Input
              id="accuracy"
              type="number"
              min="0"
              max="100"
              value={formData.accuracyPercentage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accuracy_percentage: Number.parseInt(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grid-type">Grid Type</Label>
            <Select
              value={formData.gridType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  gridType: value,
                  correctCells: [],
                }))
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select grid type" />
              </SelectTrigger>
              <SelectContent>
                {GRID_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {formData.imageUrl && (
            <div className="space-y-2">
              <Label>Select Correct Cells</Label>
              <GridSelector
                gridType={formData.gridType}
                imageUrl={formData.imageUrl}
                selectedCells={formData.correctCells}
                onSelectionChange={(cells) =>
                  setFormData((prev) => ({ ...prev, correctCells: cells }))
                }
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.imageUrl}>
              {isSubmitting ? 'Saving...' : captcha ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
