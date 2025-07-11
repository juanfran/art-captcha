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
import type { Captcha } from '@/lib/db';
import { Upload } from 'lucide-react';

interface CaptchaFormProps {
  captcha?: Captcha;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const GRID_TYPES = ['3x3', '3x4', '4x3', '4x4', '5x5'];

export function CaptchaForm({ captcha, onSubmit, onCancel }: CaptchaFormProps) {
  const [formData, setFormData] = useState({
    name: captcha?.name || '',
    accuracy_percentage: captcha?.accuracy_percentage || 80,
    grid_type: captcha?.grid_type || '3x3',
    image_url: captcha?.image_url || '',
    correct_cells: captcha?.correct_cells || [],
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
          image_url: e.target?.result as string,
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
              value={formData.accuracy_percentage}
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
              value={formData.grid_type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  grid_type: value,
                  correct_cells: [],
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

          {formData.image_url && (
            <div className="space-y-2">
              <Label>Select Correct Cells</Label>
              <GridSelector
                gridType={formData.grid_type}
                imageUrl={formData.image_url}
                selectedCells={formData.correct_cells}
                onSelectionChange={(cells) =>
                  setFormData((prev) => ({ ...prev, correct_cells: cells }))
                }
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.image_url}>
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
