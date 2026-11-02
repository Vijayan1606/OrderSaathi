"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Profile, Retailer, UserRole } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  profile: Profile | null;
  retailer?: Retailer | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.authenticated && json.profile) {
        setProfile(json.profile);
        setRetailer(json.retailer || null);
        setRole(json.role || json.profile.role);
      } else {
        setProfile(null);
        setRetailer(null);
        setRole(null);
      }
    } catch (err) {
      console.warn("Failed to refresh session:", err);
      setProfile(null);
      setRetailer(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setProfile(null);
      setRetailer(null);
      setRole(null);
      setIsLoading(false);
      // Clear any stored client cart
      if (typeof window !== "undefined") {
        localStorage.removeItem("ordersaathi_cart");
      }
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        retailer,
        role,
        isAuthenticated: Boolean(profile),
        isLoading,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
