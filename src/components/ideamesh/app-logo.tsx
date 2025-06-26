import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

// The props for this component will be passed to the wrapping div
interface AppLogoProps extends HTMLAttributes<HTMLDivElement> {}

export default function AppLogo({ className, ...props }: AppLogoProps) {
  return (
    // The parent div needs to be relative for the Image with `fill` to work.
    // It also takes the className to control its size (e.g., 'h-12 w-12').
    <div className={cn('relative', className)} {...props}>
      <Image
        src="/assets/images/icon/icon.png"
        alt="IdeaMesh Logo"
        fill
        sizes="48px" // A hint for the browser on how large the image will be. 48px is the largest usage.
        className="object-contain"
        priority
      />
    </div>
  );
}
