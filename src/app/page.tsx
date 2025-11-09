'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, History, BarChart3, Users } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: '일일 회고 작성',
      description: 'KPT, PMI 템플릿을 활용한 체계적인 회고 작성',
      href: '/retrospective',
    },
    {
      icon: History,
      title: '회고 히스토리',
      description: '과거 회고 내용을 확인하고 성장 과정을 추적',
      href: '/history',
    },
    {
      icon: BarChart3,
      title: '주간 리포트',
      description: 'AI 분석을 통한 주간 성과 및 개선점 리포트',
      href: '/reports',
    },
    {
      icon: Users,
      title: '팀 관리',
      description: '팀원 관리 및 성과 대시보드',
      href: '/team',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          회고리즘
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          성장하는 사람들의 회고 알고리즘 플랫폼
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/retrospective">
            <Button size="lg">
              회고 시작하기
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="lg">
              리포트 보기
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link key={index} href={feature.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          회고리즘의 특징
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">체계적인 회고</h3>
            <p className="text-gray-600">
              KPT, PMI 템플릿을 활용하여 구조화된 회고를 통해 명확한 인사이트를 도출합니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI 분석</h3>
            <p className="text-gray-600">
              인공지능을 통한 자동 분석으로 주간 성과와 개선점을 제공합니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">팀 협업</h3>
            <p className="text-gray-600">
              팀원들과 함께 회고를 공유하고 조직의 실행력을 높입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
