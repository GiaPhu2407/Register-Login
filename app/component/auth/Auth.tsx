import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hook/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/Login');
      } else if (requireAdmin && user.role !== 'Admin') {
        router.push('/');
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (requireAdmin && user.role !== 'Admin')) {
    return null;
  }

  return <>{children}</>;
}