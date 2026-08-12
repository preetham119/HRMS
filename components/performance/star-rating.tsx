'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: {
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}) {
  const current = value ?? 0;
  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => {
        const active = current >= score;
        const half = !active && current >= score - 0.5;
        return (
          <button
            key={score}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(score)}
            onContextMenu={(event) => {
              event.preventDefault();
              if (!readOnly) onChange?.(score - 0.5);
            }}
            className={cn('rounded p-0.5 transition', !readOnly && 'hover:scale-110')}
            aria-label={`Rate ${score}`}
          >
            <Star
              className={cn(
                starSize,
                active || half ? 'fill-amber-400 text-amber-400' : 'text-slate-300',
                half && 'opacity-70',
              )}
            />
          </button>
        );
      })}
      <span className="ml-1 text-sm font-semibold text-slate-700">{current ? current.toFixed(1) : '—'}</span>
    </div>
  );
}
