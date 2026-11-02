"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, Retailer, UserRole } from "@/types";
import { db } from "@/lib/db";

interface AuthContextType {
  profile: Profile;
  retailer?: Retailer;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(db.getCurrentUser().profile);
  const [retailer, setRetailer] = useState<Retailer | undefined>(
    db.getCurrentUser().retailer
  );
  const [role, setRole] = useState<UserRole>(db.currentRole);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = db.getCurrentUser();
    setProfile(user.profile);
    setRetailer(user.retailer);
    setRole(db.currentRole);
  }, []);

  const switchRole = (newRole: UserRole) => {
    setIsLoading(true);
    db.switchRole(newRole);
    const user = db.getCurrentUser();
    setProfile(user.profile);
    setRetailer(user.retailer);
    setRole(newRole);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        retailer,
        role,
        switchRole,
        isLoading,
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
