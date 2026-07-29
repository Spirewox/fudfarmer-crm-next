import { cn } from '@/lib/utils';

export type BrandLogoVariant = 'color' | 'white' | 'black';

const LOGO_SRC: Record<BrandLogoVariant, string> = {
  color: '/logo/fudfarmer-color.svg',
  white: '/logo/fudfarmer-white.svg',
  black: '/logo/fudfarmer-black.svg',
};

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  /** Rendered width in px; height follows the 596×183 aspect ratio. */
  width?: number;
  priority?: boolean;
};

export function BrandLogo({
  variant = 'color',
  className,
  width = 180,
  priority = false,
}: BrandLogoProps) {
  const height = Math.round(width * (183 / 596));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC[variant]}
      alt="Fudfarmer"
      width={width}
      height={height}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      className={cn('h-auto select-none', className)}
      style={{ width, height: 'auto' }}
    />
  );
}
