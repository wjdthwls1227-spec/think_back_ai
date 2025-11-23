/**
 * 토스 스타일 디자인 시스템 컴포넌트
 * 
 * [스타일 가이드]
 * 
 * 색상 토큰:
 * - bg: #050816 (배경)
 * - card: #0B1020 ~ #111827 (서피스 카드)
 * - text: #E5E7EB (기본 텍스트)
 * - mutedText: #9CA3AF (서브 텍스트)
 * - primary: #3B82F6 (Primary 액션)
 * - border: #1F2937 (경계선, 최소한으로 사용)
 * 
 * 타이포그래피:
 * - h1: text-[32px] ~ text-[40px], font-semibold, leading-tight
 * - h2: text-[24px] ~ text-[28px], font-semibold
 * - h3: text-[20px], font-semibold
 * - body: text-[16px], leading-relaxed
 * - caption: text-[13px] ~ text-[14px], text-neutral-400
 * 
 * Spacing (8의 배수):
 * - 8/16/24/32/48/64/72/96
 * 
 * 섹션 간격:
 * - sectionY: py-16 lg:py-24 (64px ~ 96px)
 * 
 * 카드 스타일:
 * - rounded-2xl border border-white/5 bg-white/[0.03]
 * - p-6 (24px)
 */

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

/* ---------- Layout Components ---------- */

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050816] text-[#E5E7EB]">
      {showHeader && <Header />}
      <main className="mx-auto max-w-[840px] px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[840px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <span className="text-sm font-semibold">회</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">회고리즘</span>
            <span className="text-xs text-[#9CA3AF]">ThinkBack AI</span>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-[#9CA3AF] sm:flex">
          <a href="#for-whom" className="hover:text-[#E5E7EB] transition-colors">
            누구에게 필요한가
          </a>
          <a href="#stories" className="hover:text-[#E5E7EB] transition-colors">
            변화 사례
          </a>
          <a href="#programs" className="hover:text-[#E5E7EB] transition-colors">
            프로그램
          </a>
          <PrimaryButton href="/login?redirect=/app/journal" size="sm">
            회고 시작하기
          </PrimaryButton>
        </nav>
        <div className="sm:hidden">
          <PrimaryButton href="/login?redirect=/app/journal" size="sm">
            시작하기
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-16 lg:py-24 ${className}`}
    >
      <div className="mb-12 space-y-4">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-wider text-[#9CA3AF]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[24px] font-semibold leading-tight sm:text-[28px]">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-[#9CA3AF]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ---------- Button Components ---------- */

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
}

export function PrimaryButton({
  href,
  onClick,
  children,
  size = 'md',
  icon: Icon,
  className = '',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full bg-[#3B82F6] font-semibold text-white transition-colors hover:bg-[#2563EB] ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  href,
  onClick,
  children,
  size = 'md',
  icon: Icon,
  className = '',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] font-semibold text-[#E5E7EB] transition-colors hover:bg-white/[0.06] hover:border-white/20 ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ---------- Card Components ---------- */

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          {badge}
        </span>
      )}
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  detail?: string;
}

export function StatCard({ value, label, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="mb-2 text-3xl font-semibold text-[#3B82F6]">{value}</div>
      <div className="mb-1 text-sm font-semibold">{label}</div>
      {detail && <div className="text-xs text-[#9CA3AF]">{detail}</div>}
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  tag?: string;
}

export function TestimonialCard({
  name,
  role,
  quote,
  tag,
}: TestimonialCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <p className="mb-4 text-sm leading-relaxed">"{quote}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-semibold">
            {name.slice(0, 1)}
          </div>
          <div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-[#9CA3AF]">{role}</div>
          </div>
        </div>
        {tag && (
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#9CA3AF]">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

interface ProgramCardProps {
  title: string;
  tag: string;
  description: string;
  meta: string;
  href?: string;
}

export function ProgramCard({
  title,
  tag,
  description,
  meta,
  href,
}: ProgramCardProps) {
  const cardContent = (
    <>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          {tag}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
      <p className="text-xs text-[#9CA3AF]">{meta}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      {cardContent}
    </div>
  );
}

