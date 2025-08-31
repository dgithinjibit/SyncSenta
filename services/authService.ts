import { supabase } from '../supabase/client';
import type { UserRole, UserData } from '../types';
import type { AuthError, User } from '@supabase/supabase-js';

const processSupabaseUser = (user: User | null): UserData | null => {
    if (!user) return null;
    return {
        uid: user.id,
        email: user.email ?? null,
        displayName: user.user_metadata?.display_name as string | undefined,
        // Default to STUDENT if role is not set in metadata
        role: (user.user_metadata?.role as UserRole) || 'STUDENT',
        schoolId: user.user_metadata?.school_id as string | undefined,
        county: user.user_metadata?.county as string | undefined,
    };
};


export const signUpUser = async (email: string, password: string, role: UserRole, displayName: string | undefined, schoolId?: string, county?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
        display_name: displayName,
        school_id: (role === 'TEACHER' || role === 'SCHOOL_HEAD') ? schoolId : undefined,
        county: (role === 'COUNTY_OFFICER' || role === 'TEACHER' || role === 'SCHOOL_HEAD') ? county : undefined,
      }
    }
  });
  return { user: data.user, error };
};

export const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { user: data.user, error };
};

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    return { error };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const onAuthUserStateChanged = (callback: (userData: UserData | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        callback(processSupabaseUser(user));
    });

    return () => {
        subscription.unsubscribe();
    };
};
