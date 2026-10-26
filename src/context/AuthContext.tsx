import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

type AuthResult = {
  error: string | null;
  needsEmailConfirmation?: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signOut: () => Promise<AuthResult>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Failed to load auth session:",
          error.message
        );
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const { data, error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
      needsEmailConfirmation:
        !!data.user && !data.session,
    };
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
    };
  }

  async function signOut(): Promise<AuthResult> {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}