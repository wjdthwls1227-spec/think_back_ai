'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const { signInWithKakao } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithKakao();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className={`bg-yellow-400 hover:bg-yellow-500 text-black font-semibold ${className || ''}`}
      size="lg"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      {loading ? '로그인 중...' : '카카오로 로그인'}
    </Button>
  );
}