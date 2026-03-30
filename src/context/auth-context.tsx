"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  requestEmailVerification,
  registerWithEmail,
  requestPasswordReset,
} from "@/services/auth";
import { ensureUserProfile, getUserProfile } from "@/services/users";
import { UserProfile } from "@/types";

const E2E_STORAGE_KEY = "futbol-goals-store-e2e-session";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseEnabled: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  requestPasswordReset: (input: { email: string; continueUrl?: string }) => Promise<void>;
  requestEmailVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const e2eBypassEnabled = process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === "true";
  const [mockSessionEnabled, setMockSessionEnabled] = useState(false);
  const firebaseEnabled = isFirebaseConfigured() || e2eBypassEnabled || mockSessionEnabled;
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function loadMockSession() {
      const rawValue = window.localStorage.getItem(E2E_STORAGE_KEY);

      if (!rawValue) {
        setMockSessionEnabled(false);
        setUser(null);
        setProfile(null);
        if (!isFirebaseConfigured() || e2eBypassEnabled) {
          setLoading(false);
        }
        return;
      }

      const session = JSON.parse(rawValue) as {
        uid: string;
        email: string;
        displayName: string;
        role: "admin" | "customer";
        emailVerified: boolean;
      };

      const mockUser = {
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        emailVerified: session.emailVerified,
        getIdToken: async () => "e2e-token",
        reload: async () => undefined,
      } as User;

      setMockSessionEnabled(true);
      setUser(mockUser);
      setProfile({
        uid: session.uid,
        name: session.displayName,
        email: session.email,
        role: session.role,
        emailVerified: session.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
    }

    loadMockSession();
    window.addEventListener("storage", loadMockSession);

    return () => {
      window.removeEventListener("storage", loadMockSession);
    };
  }, [e2eBypassEnabled]);

  useEffect(() => {
    if (!firebaseEnabled || !auth || mockSessionEnabled) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      await ensureUserProfile({
        uid: currentUser.uid,
        name: currentUser.displayName ?? (currentUser.email?.split("@")[0] ?? "Cliente"),
        email: currentUser.email ?? "",
        emailVerified: currentUser.emailVerified,
      });

      const currentProfile = await getUserProfile(currentUser.uid);
      setProfile(currentProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseEnabled, mockSessionEnabled]);

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

  async function sendEmailVerification() {
    if (!user) {
      throw new Error("Necesitas una sesion activa para reenviar la verificacion.");
    }

    await requestEmailVerification({
      token: await user.getIdToken(),
    });
    await refreshProfile();
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
        isEmailVerified: Boolean(user?.emailVerified),
        login,
        loginWithGoogle: signInWithGoogle,
        register,
        requestPasswordReset: sendPasswordReset,
        requestEmailVerification: sendEmailVerification,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
