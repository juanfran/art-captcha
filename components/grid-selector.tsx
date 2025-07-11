'use client';
import { cn } from '@/lib/utils';

interface GridSelectorProps {
  gridType: string;
  imageUrl: string;
  selectedCells: number[];
  onSelectionChange: (cells: number[]) => void;
}

export function GridSelector({
  gridType,
  imageUrl,
  selectedCells,
  onSelectionChange,
}: GridSelectorProps) {
  const [rows, cols] = gridType.split('x').map(Number);
  const totalCells = rows * cols;

  const toggleCell = (index: number) => {
    const newSelection = selectedCells.includes(index)
      ? selectedCells.filter((cell) => cell !== index)
      : [...selectedCells, index];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt="Captcha"
          className="w-full max-w-md mx-auto rounded-lg"
        />
        <div
          className="absolute inset-0 grid gap-1 p-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}>
          {Array.from({ length: totalCells }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleCell(index)}
              className={cn(
                'border-2 border-white/50 hover:border-white transition-colors',
                selectedCells.includes(index)
                  ? 'bg-green-500/50 border-green-400'
                  : 'hover:bg-white/20',
              )}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Selected cells: {selectedCells.length} / {totalCells}
      </p>
    </div>
  );
}
