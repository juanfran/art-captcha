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
import type { Captcha, CaptchaFormValues } from '@/lib/captcha.model';
import { Upload, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { validateUploadedFile } from '@/lib/image-validation';

interface CaptchaFormProps {
  captcha?: Captcha;
  onSubmit: (data: Omit<CaptchaFormValues, 'createdBy'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const GRID_TYPES = ['3x3', '3x4', '4x3', '4x4', '5x5'];

export function CaptchaForm({
  captcha,
  onSubmit,
  onCancel,
  isLoading = false,
}: CaptchaFormProps) {
  const [formData, setFormData] = useState({
    name: captcha?.name || '',
    accuracyPercentage: captcha?.accuracyPercentage || 80,
    gridType: captcha?.gridType || '3x3',
    imageUrl: captcha?.imageUrl || '',
    correctCells: captcha?.correctCells || ([] as number[]),
  });
  const [isUploading, setIsUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    original: { size: string };
    compressed: { size: string };
    compressionRatio: string;
    savedBytes: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      toast.error(`Upload failed: ${validation.errors.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setCompressionInfo(null);

    try {
      // Convert file to data URL for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        try {
          // Upload and compress image
          const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: dataUrl,
              compressionOptions: {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 85,
                format: 'jpeg',
              },
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.details?.join(', ') || error.error || 'Upload failed',
            );
          }

          const result = await response.json();

          // Update form data with compressed image
          setFormData((prev) => ({
            ...prev,
            imageUrl: result.compressedImageUrl,
            correctCells: [], // Reset selections when image changes
          }));

          // Show compression info
          setCompressionInfo({
            original: { size: result.metadata.original.sizeFormatted },
            compressed: { size: result.metadata.compressed.sizeFormatted },
            compressionRatio: result.metadata.compressionRatio,
            savedBytes: result.metadata.savedBytesFormatted,
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(
            `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
                  accuracyPercentage: Number.parseInt(e.target.value),
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {compressionInfo && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {compressionInfo.original.size} →{' '}
                  {compressionInfo.compressed.size} (
                  {compressionInfo.compressionRatio} saved)
                </div>
              )}
            </div>
            {formData.imageUrl && !isUploading && (
              <div className="text-sm text-green-600">
                ✓ Image uploaded and compressed successfully
              </div>
            )}
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
              disabled={isLoading || isUploading || !formData.imageUrl}>
              {isLoading ? 'Saving...' : captcha ? 'Update' : 'Create'}
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
