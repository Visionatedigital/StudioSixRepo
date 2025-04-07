import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export function VerifiedBadge({ className, size = 16 }: VerifiedBadgeProps) {
  return (
    <div className={cn('inline-block', className)}>
      <Image
        src="/icons/verified.svg"
        alt="Verified"
        width={size}
        height={size}
        className="inline-block"
      />
    </div>
  );
} 