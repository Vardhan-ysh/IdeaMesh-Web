import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  // The storageBucket format should be `your-project-id.appspot.com`.
  // We will construct it here from the projectId to ensure it's correct.
  storageBucket: projectId ? `${projectId}.appspot.com` : undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the config to the console for debugging purposes.
// This will show you exactly what values are being passed to Firebase.
console.log('--- Firebase Debug ---');
console.log('Attempting to initialize with this config (storageBucket is auto-corrected):');
console.table(firebaseConfig);
console.log('----------------------');


// This provides a more helpful error message than the default Firebase one
// if the environment variables are missing.
if (Object.values(firebaseConfig).some(value => !value)) {
  throw new Error('Firebase configuration is missing or incomplete. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set. After updating, you MUST restart your development server.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
