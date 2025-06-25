'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (error: any) {
      if (error.code === 'auth/configuration-not-found') {
        console.error(
`
---------------------------------------------------------------------
Firebase Error: Configuration Not Found (auth/configuration-not-found)
---------------------------------------------------------------------
This is a Firebase project configuration issue, not a code bug.
It means your Firebase project is not set up to allow authentication from this web app.

Please check the following in your Firebase Console:

1.  ENABLE GOOGLE SIGN-IN:
    - Go to: Authentication > Sign-in method
    - Click on "Google" and make sure it is ENABLED.
    - Select a project support email if prompted.

2.  AUTHORIZE YOUR DOMAIN:
    - Go to: Authentication > Settings > Authorized domains
    - Click "Add domain" and add the domain you are currently on.
    - For this development environment, the domain is likely: ${window.location.hostname}

This must be fixed in the Firebase Console, not in the code.
---------------------------------------------------------------------
`
        );
      }
      console.error('Error signing in with Google', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
