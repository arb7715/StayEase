"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, userData: any) => Promise<User>;
  login: (email: string, password: string, remember?: boolean) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email: string, password: string, userData: any) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      ...userData,
      email,
      createdAt: new Date().toISOString(),
    });

    return userCredential.user;
  }

  async function login(email: string, password: string, remember = false) {
    // Set persistence based on "remember me" checkbox
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

    return {
      user: userCredential.user,
      userData: userDoc.data(),
    };
  }

  function logout() {
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  // Show a loading indicator while the auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
