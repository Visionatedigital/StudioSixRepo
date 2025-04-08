import { useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProjectAccessGuardProps {
  projectId: string;
  children: ReactNode;
}

export default function ProjectAccessGuard({ projectId, children }: ProjectAccessGuardProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wait for session to be loaded
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/sign-in');
      return;
    }

    if (!projectId) {
      return;
    }

    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/check-access`);
        const data = await response.json();

        if (data.hasAccess) {
          setHasAccess(true);
        } else {
          // Handle different reasons for no access
          if (data.reason === 'pending_invitation') {
            toast.info(
              'You need to accept the invitation before accessing this project.',
              { duration: 5000 }
            );
          } else if (data.reason === 'not_found') {
            toast.error('Project not found.');
          } else if (data.reason === 'no_access') {
            toast.error('You do not have access to this project.');
          }
          
          // Redirect to projects page
          router.push('/ai-design-assistant/projects');
        }
      } catch (error) {
        console.error('Error checking project access:', error);
        toast.error('Failed to check project access. Please try again.');
        router.push('/ai-design-assistant/projects');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [projectId, session, status, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
} 