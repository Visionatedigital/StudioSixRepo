import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface UserAvatarProps {
  name: string | null;
  image: string | null;
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ name, image, verified, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={image || undefined} alt={name || 'User'} />
        <AvatarFallback>
          {name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {verified && (
        <VerifiedBadge className="absolute -bottom-1 -right-1" />
      )}
    </div>
  );
} 