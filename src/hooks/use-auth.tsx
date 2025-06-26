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
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // User is signed in, get their profile
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // Create a new user profile document
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            walkthroughCompleted: false,
          };
          await setDoc(userRef, newUserProfile);
          setUserProfile(newUserProfile);
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
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

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const value = { user, loading, userProfile, signInWithGoogle, signOut, updateUserProfile };

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
