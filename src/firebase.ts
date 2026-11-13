import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User } from './types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// 사용자 제공 Firebase 공식 설정
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBC3_mhyCGCZbl5X9PsytImAl1kdR1UhJw",
  authDomain: "mylinkpage.firebaseapp.com",
  projectId: "mylinkpage",
  storageBucket: "mylinkpage.firebasestorage.app",
  messagingSenderId: "934038635153",
  appId: "1:934038635153:web:e9cfaacc9573e29f07b530",
  measurementId: "G-TT1V6G14RH"
};

const FIREBASE_CONFIG_STORAGE_KEY = 'mylink_firebase_config_v1';

// Get config from hardcoded official settings first
export const getActiveFirebaseConfig = (): FirebaseConfig => {
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
};

export const isFirebaseConfigured = (): boolean => {
  return true; // 기본 설정이 내장되어 항상 준비됨
};

// Initialize Firebase App & Auth & Analytics
export const initFirebase = () => {
  const config = getActiveFirebaseConfig();

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const auth = getAuth(app);

    // Initialize Analytics if supported in the browser
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          getAnalytics(app);
        }
      }).catch((e) => console.log('Analytics not supported in this environment', e));
    }

    return { app, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Convert Firebase User to MyLink User
export const mapFirebaseUserToMyLinkUser = (fbUser: FirebaseUser): User => {
  const email = fbUser.email || '';
  const emailPrefix = email.split('@')[0] || 'user';
  const name = fbUser.displayName || emailPrefix;
  const handle = '@' + emailPrefix;

  return {
    id: fbUser.uid,
    email: email,
    name: name,
    handle: handle,
    bio: `안녕하세요, ${name}의 마이링크입니다.`,
    avatarUrl:
      fbUser.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        emailPrefix
      )}&backgroundColor=e2e8f0`,
  };
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<User> => {
  const fb = initFirebase();
  if (!fb) {
    throw new Error('FIREBASE_INITIALIZATION_FAILED');
  }

  try {
    const result = await signInWithPopup(fb.auth, googleProvider);
    return mapFirebaseUserToMyLinkUser(result.user);
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
// Sign up with Firebase Email & Password
export const signUpWithFirebaseEmail = async (
  email: string,
  pass: string,
  displayName: string
): Promise<User> => {
  const fb = initFirebase();
  if (!fb) {
    throw new Error('FIREBASE_INITIALIZATION_FAILED');
  }

  const cred = await createUserWithEmailAndPassword(fb.auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }

  const updatedUser: User = {
    id: cred.user.uid,
    email: cred.user.email || email,
    name: displayName || email.split('@')[0],
    handle: '@' + email.split('@')[0],
    bio: `안녕하세요, ${displayName || email.split('@')[0]}의 마이링크입니다.`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      email.split('@')[0]
    )}&backgroundColor=e2e8f0`,
  };

  return updatedUser;
};

// Sign in with Firebase Email & Password
export const signInWithFirebaseEmail = async (
  email: string,
  pass: string
): Promise<User> => {
  const fb = initFirebase();
  if (!fb) {
    throw new Error('FIREBASE_INITIALIZATION_FAILED');
  }

  const cred = await signInWithEmailAndPassword(fb.auth, email, pass);
  return mapFirebaseUserToMyLinkUser(cred.user);
};

// Sign out
export const logOutFromFirebase = async (): Promise<void> => {
  const fb = initFirebase();
  if (!fb) return;
  try {
    await signOut(fb.auth);
  } catch (error) {
    console.error('Firebase Sign Out Error:', error);
  }
};

// Listen to Auth State
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  const fb = initFirebase();
  if (!fb) {
    return () => {};
  }
  return onAuthStateChanged(fb.auth, (fbUser) => {
    if (fbUser) {
      callback(mapFirebaseUserToMyLinkUser(fbUser));
    } else {
      callback(null);
    }
  });
};
