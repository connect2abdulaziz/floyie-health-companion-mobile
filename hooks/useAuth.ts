import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import type { Session, User } from "@supabase/supabase-js";

export type AuthRole = "user" | "caregiver" | "doctor";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: AuthRole
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error || !data.user) return { error: error ?? { message: "Failed to create user" } };
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: data.user.id, role });
    if (roleError) return { error: roleError };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const user: User | null = session?.user ?? null;

  return {
    session,
    user,
    loading,
    isAuthenticated: !!session?.user,
    signIn,
    signUp,
    signOut,
  };
}
