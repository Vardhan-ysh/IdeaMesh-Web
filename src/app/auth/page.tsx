'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import LoadingScreen from '@/components/ideamesh/loading-screen';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.04C34.553 7.965 29.803 6 24 6 12.43 6 3 15.43 3 27s9.43 21 21 21 21-9.43 21-21c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.04C34.553 7.965 29.803 6 24 6 16.3 6 9.698 9.858 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 48c5.803 0 11.049-2.025 14.804-5.196l-6.522-5.026C29.696 40.679 26.961 42 24 42c-5.222 0-9.61-3.311-11.28-7.784l-6.573 4.819C9.698 44.142 16.3 48 24 48z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.274 4.481-4.135 5.925l6.522 5.026C41.975 35.918 44 31.636 44 27c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  if (loading || user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrainCircuit className="mb-4 h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold font-headline">Welcome to IdeaMesh</h1>
          <p className="mt-2 text-muted-foreground">Sign in to create and manage your knowledge graphs.</p>
        </div>
        <div className="rounded-xl border border-border/20 bg-card/80 p-6 shadow-2xl backdrop-blur-2xl">
          <Button onClick={signInWithGoogle} className="w-full" variant="outline">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
