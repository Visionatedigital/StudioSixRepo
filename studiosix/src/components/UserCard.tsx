import { UserAvatar } from '@/components/UserAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    verified?: boolean;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center space-x-3 p-4">
      <UserAvatar
        name={user.name}
        image={user.image}
        verified={user.verified}
      />
      <div>
        <div className="flex items-center space-x-1">
          <h3 className="font-semibold">{user.name}</h3>
          {user.verified && (
            <VerifiedBadge className="ml-1" />
          )}
        </div>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
} 