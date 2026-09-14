"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider: "google" | "email" | "github" | "twitter" | "sandbox" | string;
  createdAt?: string;
  accountId?: string;
}

const AUTH_CHANGE_EVENT = "verisett_auth_change";

export function dispatchAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const readLocalUser = useCallback((): AuthUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const email = localStorage.getItem("verisett_user_email");
      if (!email) return null;

      const name = localStorage.getItem("verisett_user_name") || email.split("@")[0];
      const avatar = localStorage.getItem("verisett_user_avatar") || null;
      const provider = localStorage.getItem("verisett_auth_provider") || "google";
      const createdAt = localStorage.getItem("verisett_session_timestamp") || undefined;
      const accountId = localStorage.getItem("verisett_account_id") || "VAULT-2026-IN-982";

      return {
        email,
        name,
        avatar,
        provider,
        createdAt,
        accountId,
      };
    } catch {
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const local = readLocalUser();
    if (local) {
      setUser(local);
      setIsLoaded(true);
      return;
    }

    // Try Supabase session fallback
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const supaUser = data.session.user;
        const email = supaUser.email || "operator@enterprise-vault.com";
        const name =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          email.split("@")[0];
        const avatar =
          supaUser.user_metadata?.avatar_url ||
          supaUser.user_metadata?.picture ||
          null;
        const provider = supaUser.app_metadata?.provider || "supabase";

        const resolved: AuthUser = {
          id: supaUser.id,
          email,
          name,
          avatar,
          provider,
          accountId: "VAULT-" + supaUser.id.substring(0, 8).toUpperCase(),
        };

        // Persist to localStorage for consistency
        localStorage.setItem("verisett_user_email", email);
        localStorage.setItem("verisett_user_name", name);
        if (avatar) localStorage.setItem("verisett_user_avatar", avatar);
        localStorage.setItem("verisett_auth_provider", provider);

        setUser(resolved);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, [readLocalUser]);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    // Supabase auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem("verisett_user_email");
      localStorage.removeItem("verisett_user_name");
      localStorage.removeItem("verisett_user_avatar");
      localStorage.removeItem("verisett_auth_provider");
      localStorage.removeItem("verisett_session_timestamp");
      localStorage.removeItem("verisett_account_id");
    } catch {
      // Ignore
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }

    setUser(null);
    dispatchAuthChange();
  }, []);

  const updateProfile = useCallback(
    (updates: { name?: string; avatar?: string | null }) => {
      if (typeof window === "undefined" || !user) return;

      try {
        if (updates.name) {
          localStorage.setItem("verisett_user_name", updates.name);
        }
        if (updates.avatar !== undefined) {
          if (updates.avatar) {
            localStorage.setItem("verisett_user_avatar", updates.avatar);
          } else {
            localStorage.removeItem("verisett_user_avatar");
          }
        }
        dispatchAuthChange();
      } catch {
        // Ignore
      }
    },
    [user]
  );

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoaded,
    signOut,
    updateProfile,
    refreshUser,
  };
}
