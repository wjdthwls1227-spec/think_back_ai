'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithKakao: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        
        // 관리자 권한 체크
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(profile?.role === 'admin' || profile?.role === 'owner');
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          if (event === 'SIGNED_IN') {
            await createOrUpdateProfile(session.user);
          }
          
          // 관리자 권한 체크
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(profile?.role === 'admin' || profile?.role === 'owner');
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    try {
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', selectError);
        return;
      }

      if (!existingProfile) {
        const profileData = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'owner' as const,
        };

        console.log('Creating profile with data:', profileData);

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select();

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully for user:', user.id);
        }
      }
    } catch (error) {
      console.error('Unexpected error in createOrUpdateProfile:', error);
    }
  };

  const signInWithKakao = async () => {
    // 현재 접속한 도메인을 자동으로 사용, 환경변수는 fallback
    const siteUrl = window.location.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Kakao:', error);
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    // 현재 접속한 도메인을 자동으로 사용, 환경변수는 fallback
    const siteUrl = window.location.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error sending magic link:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('=== 로그아웃 시작 ===');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('Unexpected signOut error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signInWithKakao,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}