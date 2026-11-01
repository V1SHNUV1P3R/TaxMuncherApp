import { supabase, isBackendConfigured } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { AppState } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";

/*
  AuthContext defines what auth-related data the rest of the app can access.

  session:
    - null  → user is not logged in
    - Session object → user is logged in

  isLoading:
    - true  → we are still checking auth status
    - false → auth status is known
*/
type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
};

// Create a React Context for auth state
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/*
  AuthProvider wraps the entire app (see _layout.tsx).

  It is responsible for:
  - Checking if a user is already logged in
  - Listening for login/logout events
  - Storing the current session
  - Making auth state available everywhere via useAuth()
*/
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isBackendConfigured);

  useEffect(() => {
    if (!isBackendConfigured) {
      return;
    }
    let mounted = true;

    /*
      Step 1: On app startup, ask Supabase:
      "Is there already a logged-in user?"

      This handles cases like:
      - App reload
      - App reopened
      - Token still valid
    */
    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(currentSession ?? null);
      } catch (err) {
        console.warn("AuthProvider: getSession failed", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    /*
      Step 2: Listen for auth changes (login, logout, token refresh).

      This is CRITICAL:
      - We only want ONE auth listener in the entire app.
      - This prevents race conditions and duplicated listeners.
    */
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
    });

    // Cleanup when app unmounts
    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isBackendConfigured) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    supabase.auth.startAutoRefresh();
    return () => {
      sub.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/*
  useAuth is a convenience hook so screens can do:

    const { session, isLoading } = useAuth();

  instead of dealing with context directly.
*/
export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? { session: null, isLoading: false };
}
