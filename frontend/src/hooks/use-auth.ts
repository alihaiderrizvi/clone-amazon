'use client';

import { useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    // TODO: Fetch user profile from backend API
    // For now, create a basic user object from Supabase user
    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      role: 'customer',
      createdAt: supabaseUser.created_at,
      updatedAt: new Date().toISOString(),
    };
    return user;
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          const user = await fetchUserProfile(supabaseUser);
          setState({
            user,
            supabaseUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            supabaseUser: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setState({
          user: null,
          supabaseUser: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: SupabaseUser } | null) => {
        if (session?.user) {
          const user = await fetchUserProfile(session.user);
          setState({
            user,
            supabaseUser: session.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            supabaseUser: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) throw error;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}
