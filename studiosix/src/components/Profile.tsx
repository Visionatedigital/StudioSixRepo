import { UserAvatar } from '@/components/UserAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    verified?: boolean;
  };
}

export function Profile({ user }: ProfileProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <UserAvatar
        name={user.name}
        image={user.image}
        verified={user.verified}
        size="lg"
      />
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          {user.verified && (
            <VerifiedBadge className="ml-1" />
          )}
        </div>
        <p className="text-gray-500">{user.email}</p>
      </div>
    </div>
  );
} 