'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Mail, Calendar, Crown, User } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'member';
  created_at: string;
}

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <TeamManagement />
    </ProtectedRoute>
  );
}

function TeamManagement() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      // 실제 구현에서는 이메일 초대 기능을 추가할 수 있습니다
      // 현재는 시뮬레이션만 구현
      console.log('Inviting user:', inviteEmail);
      
      // 여기서는 단순히 알림만 표시
      alert(`${inviteEmail}로 초대 이메일을 발송했습니다. (시뮬레이션)`);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('사용자 초대 중 오류가 발생했습니다.');
    } finally {
      setInviting(false);
    }
  };

  const getUserStats = (userId: string) => {
    // 실제 구현에서는 해당 사용자의 통계를 가져올 수 있습니다
    return {
      totalEntries: Math.floor(Math.random() * 30) + 1,
      thisWeekEntries: Math.floor(Math.random() * 7) + 1,
      lastLoginDays: Math.floor(Math.random() * 30) + 1,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const currentUserProfile = profiles.find(p => p.id === user?.id);
  const isOwner = currentUserProfile?.role === 'owner';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">팀 관리</h1>
        <p className="text-gray-600">
          팀원들의 활동 현황을 확인하고 새로운 멤버를 초대하세요.
        </p>
      </div>

      {/* 팀 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
                <p className="text-gray-600">총 팀원 수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => getUserStats(p.id).lastLoginDays <= 7).length}
                </p>
                <p className="text-gray-600">이번 주 활성 사용자</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.role === 'owner').length}
                </p>
                <p className="text-gray-600">관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 팀원 초대 */}
      {isOwner && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              새 팀원 초대
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="초대할 사용자의 이메일 주소"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                />
              </div>
              <Button 
                onClick={handleInvite} 
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? '초대 중...' : '초대하기'}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              초대된 사용자는 이메일을 통해 팀에 참여할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 팀원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>팀원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => {
              const stats = getUserStats(profile.id);
              const isCurrentUser = profile.id === user?.id;
              
              return (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {profile.name}
                          {isCurrentUser && (
                            <span className="text-blue-600 text-sm ml-2">(나)</span>
                          )}
                        </h3>
                        {profile.role === 'owner' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {profile.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      총 회고: {stats.totalEntries}개
                    </div>
                    <div className="text-sm text-gray-600">
                      이번 주: {stats.thisWeekEntries}개
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.lastLoginDays}일 전 활동
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {profiles.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                팀원이 없습니다
              </h3>
              <p className="text-gray-600">
                첫 번째 팀원을 초대해보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}