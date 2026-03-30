"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  registerWithEmail,
  requestPasswordReset,
} from "@/services/auth";
import { getUserProfile } from "@/services/users";
import { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseEnabled: boolean;
  isAdmin: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  requestPasswordReset: (input: { email: string; continueUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseEnabled = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentProfile = await getUserProfile(currentUser.uid);
      setProfile(currentProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseEnabled]);

  async function refreshProfile() {
    if (!user) {
      setProfile(null);
      return;
    }

    const currentProfile = await getUserProfile(user.uid);
    setProfile(currentProfile);
  }

  async function login(input: { email: string; password: string }) {
    const signedUser = await loginWithEmail(input);
    const currentProfile = await getUserProfile(signedUser.uid);
    setUser(signedUser);
    setProfile(currentProfile);
  }

  async function register(input: { name: string; email: string; password: string }) {
    const signedUser = await registerWithEmail(input);
    const currentProfile = await getUserProfile(signedUser.uid);
    setUser(signedUser);
    setProfile(currentProfile);
  }

  async function signInWithGoogle() {
    const signedUser = await loginWithGoogle();
    const currentProfile = await getUserProfile(signedUser.uid);
    setUser(signedUser);
    setProfile(currentProfile);
  }

  async function sendPasswordReset(input: { email: string; continueUrl?: string }) {
    await requestPasswordReset(input);
  }

  async function logout() {
    await logoutUser();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        firebaseEnabled,
        isAdmin: profile?.role === "admin",
        login,
        loginWithGoogle: signInWithGoogle,
        register,
        requestPasswordReset: sendPasswordReset,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
