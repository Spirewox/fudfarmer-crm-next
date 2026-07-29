import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';

type BrandLoaderProps = Readonly<{
  className?: string;
  /** full = viewport centered; compact = inline content block */
  size?: 'full' | 'compact';
}>;

export function BrandLoader({ className, size = 'full' }: BrandLoaderProps) {
  const markSize = size === 'full' ? 64 : 40;

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        size === 'full' && 'min-h-screen w-full',
        size === 'compact' && 'py-16',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      <div className="brand-loader-bloom flex items-center justify-center">
        <BrandMark size={markSize} variant="brand" animatePetals title="" />
      </div>
    </div>
  );
}
