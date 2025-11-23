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
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, signupPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
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
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setIsAdmin(false);
          } else {
            const adminStatus = profile?.role === 'admin';
            console.log('AuthContext - User role check:', {
              userId: session.user.id,
              email: session.user.email,
              role: profile?.role,
              isAdmin: adminStatus
            });
            setIsAdmin(adminStatus);
          }
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
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setIsAdmin(false);
          } else {
            const adminStatus = profile?.role === 'admin';
            console.log('AuthContext - Auth state change role check:', {
              userId: session.user.id,
              email: session.user.email,
              role: profile?.role,
              isAdmin: adminStatus
            });
            setIsAdmin(adminStatus);
          }
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
          role: 'user' as const,
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

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in with password:', error);
      
      // 이메일 인증이 안 된 경우
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      
      throw error;
    }

    // 프로필이 없으면 생성
    if (data.user) {
      await createOrUpdateProfile(data.user);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, signupPath?: string) => {
    console.log('📧 [SignUp] ========== Starting signup process ==========');
    console.log('📧 [SignUp] Email:', email);
    console.log('📧 [SignUp] Display Name:', displayName);
    console.log('📧 [SignUp] Signup Path:', signupPath);
    console.log('📧 [SignUp] Redirect URL:', `${window.location.origin}/auth/callback`);
    console.log('📧 [SignUp] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
            display_name: displayName,
            signup_path: signupPath,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ [SignUp] ========== SIGNUP FAILED ==========');
        console.error('❌ [SignUp] Error object:', error);
        console.error('❌ [SignUp] Error message:', error.message);
        console.error('❌ [SignUp] Error status:', error.status);
        console.error('❌ [SignUp] Error code:', error.code);
        console.error('❌ [SignUp] Full error:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ [SignUp] ========== SIGNUP API CALL SUCCESSFUL ==========');
      console.log('✅ [SignUp] Response data:', data);
      console.log('✅ [SignUp] User ID:', data.user?.id);
      console.log('✅ [SignUp] User email:', data.user?.email);
      console.log('✅ [SignUp] Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('✅ [SignUp] Session:', data.session ? 'Created' : 'Not created');
      
      if (!data.user) {
        console.error('❌ [SignUp] ⚠️ WARNING: User object is null/undefined!');
        console.error('❌ [SignUp] This means the signup failed even though no error was returned.');
        throw new Error('User creation failed: User object is null');
      }
    
      // 이메일 전송 여부 확인
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 [SignUp] ⚠️ Email confirmation required - check your email inbox');
        console.log('📧 [SignUp] ⚠️ If email not received, check:');
        console.log('   1. Supabase Dashboard → Authentication → Providers → Email');
        console.log('   2. "Enable email confirmations" should be ON');
        console.log('   3. Check spam folder');
        console.log('   4. Supabase Dashboard → Logs → Auth Logs for errors');
      }

      // 프로필 생성 (가입경로 포함)
      if (data.user) {
      const profileData: {
        id: string;
        email: string;
        name: string;
        display_name: string;
        role: 'user';
        signup_path?: string;
      } = {
        id: data.user.id,
        email: data.user.email || email,
        name: displayName,
        display_name: displayName,
        role: 'user' as const,
      };

      // 가입경로가 있으면 추가 (컬럼이 존재하는 경우에만)
      if (signupPath) {
        profileData.signup_path = signupPath;
      }

      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        console.error('Profile data attempted:', profileData);
        console.error('Error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
        });
        
        // signup_path 컬럼이 없어서 발생한 에러인 경우, signup_path 없이 재시도
        if (profileError.code === 'PGRST204' || profileError.message?.includes('signup_path')) {
          console.log('🔄 Retrying without signup_path...');
          const { error: retryError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              name: displayName,
              display_name: displayName,
              role: 'user' as const,
            });
          
          if (retryError) {
            console.error('❌ Retry also failed:', retryError);
          } else {
            console.log('✅ Profile created without signup_path');
          }
        }
        // 프로필 생성 실패해도 계정은 생성됨 (나중에 트리거로 자동 생성될 수 있음)
      } else {
        console.log('✅ Profile created successfully:', insertedProfile);
      }
      }
    } catch (err) {
      console.error('❌ [SignUp] ========== EXCEPTION IN SIGNUP ==========');
      console.error('❌ [SignUp] Exception:', err);
      console.error('❌ [SignUp] Exception type:', typeof err);
      console.error('❌ [SignUp] Exception details:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const refreshAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setIsAdmin(false);
      } else {
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error refreshing admin status:', error);
      setIsAdmin(false);
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
        signInWithPassword,
        signUp,
        signOut,
        refreshAdminStatus,
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