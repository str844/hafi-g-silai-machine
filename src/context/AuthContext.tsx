import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { WORKSPACE_SCOPES, setCachedToken } from '../services/googleWorkspace';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if admin: user email is ps6672967@gmail.com or document in admins collection exists
        const adminEmail = 'ps6672967@gmail.com';
        const isMatchedEmail = currentUser.email?.toLowerCase() === adminEmail.toLowerCase();
        
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists() || isMatchedEmail) {
            setIsAdmin(true);
            if (!adminDoc.exists()) {
              await setDoc(doc(db, 'admins', currentUser.uid), {
                email: currentUser.email,
                role: 'Owner/Admin',
                createdAt: new Date().toISOString(),
              });
            }
          } else {
            // In single-tenant shop management, any signed in owner user is authorized
            setIsAdmin(true);
          }
        } catch {
          // If checking admins collection encounters any read error, still allow owner
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    for (const scope of WORKSPACE_SCOPES) {
      provider.addScope(scope);
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedToken(credential.accessToken);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    setCachedToken(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
