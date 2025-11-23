'use client';

import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <PageLayout>
      <Header />
      <main className="space-y-16 lg:space-y-24">
        <HeroSection />
        <ForWhomSection />
        <StoriesSection />
        <ProgramsSection />
      </main>
      <Footer />
    </PageLayout>
  );
}

/* ---------- Layout & Base Components ---------- */

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
          <span className="text-sm font-semibold">회</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">회고리즘</span>
          <span className="text-xs text-slate-400">ThinkBack AI</span>
        </div>
      </div>
      <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
        <a href="#for-whom" className="hover:text-slate-50">
          누구에게 필요한가
        </a>
        <a href="#stories" className="hover:text-slate-50">
          변화 사례
        </a>
        <a href="#programs" className="hover:text-slate-50">
          프로그램
        </a>
        <PrimaryButton href="/login?redirect=/app/journal" size="sm">
          무료로 회고 시작하기
        </PrimaryButton>
      </nav>
      <div className="flex items-center gap-2 text-xs text-slate-400 sm:hidden">
        <PrimaryButton href="/login?redirect=/app/journal" size="sm">
          시작하기
        </PrimaryButton>
      </div>
    </header>
  );
}

function Section(props: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { id, eyebrow, title, description, children } = props;

  return (
    <section id={id} className="space-y-6">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function PrimaryButton({
  href,
  children,
  size = "md",
}: {
  href?: string;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const Comp = href ? Link : "button";

  return (
    <Comp
      href={href}
      className={`inline-flex items-center justify-center rounded-full bg-sky-500 font-medium text-slate-950 shadow-sm transition hover:bg-sky-400 ${padding}`}
    >
      {children}
    </Comp>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const Comp = href ? Link : "button";

  return (
    <Comp
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
    >
      {children}
    </Comp>
  );
}

function FeatureCard(props: {
  title: string;
  description: string;
  badge?: string;
}) {
  const { title, description, badge } = props;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      {badge && (
        <span className="inline-flex w-fit rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400">
          {badge}
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-300">{description}</p>
    </div>
  );
}

function StatCard(props: { value: string; label: string; detail?: string }) {
  const { value, label, detail } = props;
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-xl font-semibold text-sky-400">{value}</span>
      <span className="mt-1 text-xs font-medium text-slate-200">{label}</span>
      {detail && (
        <span className="mt-1 text-[11px] text-slate-400">{detail}</span>
      )}
    </div>
  );
}

function TestimonialCard(props: {
  name: string;
  role: string;
  quote: string;
  tag?: string;
}) {
  const { name, role, quote, tag } = props;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs leading-relaxed text-slate-100">"{quote}"</p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100">
            {name.slice(0, 1)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-100">{name}</span>
            <span className="text-[11px] text-slate-400">{role}</span>
          </div>
        </div>
        {tag && (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgramCard(props: {
  title: string;
  tag: string;
  desc: string;
  meta: string;
}) {
  const { title, tag, desc, meta } = props;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400">
          {tag}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-300">{desc}</p>
      <p className="mt-auto text-[11px] text-slate-400">{meta}</p>
    </div>
  );
}

/* ---------- Sections ---------- */

function HeroSection() {
  return (
    <Section
      title="3분 회고, AI가 감정과 패턴까지 정리해 줍니다."
      description="회고리즘은 매일의 기록을 자동으로 구조화하고, 감정·지출·행동 패턴을 분석해 다음 행동까지 제안해 주는 회고 플랫폼입니다."
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <p className="text-sm leading-relaxed text-slate-300">
            일기, 노션, 가계부를 따로 쓰다 포기했다면, 기록 도구의 문제가 아니라
            구조의 문제일 수 있습니다. 회고리즘은 기록–분석–다음 액션까지 한
            흐름으로 이어줍니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton href="/login?redirect=/app/journal">무료로 회고 시작하기</PrimaryButton>
            <SecondaryButton href="#for-whom">
              어떻게 작동하는지 살펴보기
            </SecondaryButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>누적 참여자 24명</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>만족도 92%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid w-full gap-3 sm:grid-cols-3 lg:mt-0 lg:max-w-sm">
          <FeatureCard
            badge="기록"
            title="하루 3분 회고"
            description="오늘 있었던 일, 감정, 에너지를 짧게 남기면 됩니다. 형식은 회고리즘이 대신 잡아 줍니다."
          />
          <FeatureCard
            badge="분석"
            title="AI 감정·패턴 분석"
            description="여러 날의 회고를 묶어 감정·지출·행동 패턴을 요약해 줍니다."
          />
          <FeatureCard
            badge="다음 행동"
            title="다음 한 주 제안"
            description="어디서 에너지가 새는지, 무엇을 줄이고 무엇을 늘려야 할지 구체적인 제안을 제공합니다."
          />
        </div>
      </div>
    </Section>
  );
}

function ForWhomSection() {
  return (
    <Section
      id="for-whom"
      eyebrow="For whom"
      title="회고리즘은 이런 사람을 위해 만들었습니다."
      description="기록은 많이 해봤지만, 정리와 인사이트까지 이어지지 않았던 사람들을 위한 구조입니다."
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3 text-sm text-slate-200">
          <p>다음 중 하나라도 해당된다면, 회고리즘이 맞습니다.</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>바쁘게 살고 있지만, 무엇이 쌓이고 있는지 감이 오지 않는다.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>
                일기·노션·가계부를 여러 번 시작했지만, 결국 흐름이 끊겨 버렸다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>
                감정과 지출, 일과 관계를 따로 보지 않고 한 번에 보고 싶다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>회고의 필요성은 알지만, 어떻게 써야 할지 막막하다.</span>
            </li>
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureCard
            title="개인 회고 템플릿"
            description="무엇을 적어야 할지 고민하지 않도록, 목적별 질문 구조를 제공합니다."
            badge="Template"
          />
          <FeatureCard
            title="AI 기반 회고 분석"
            description="작성한 회고를 모아서 감정·이슈·반복 패턴을 한 번에 보여 줍니다."
            badge="AI 분석"
          />
          <FeatureCard
            title="지출·욕망 패턴 보기"
            description="새는돈 회고로 돈을 어디에, 어떤 기분으로 쓰는지 구조적으로 볼 수 있습니다."
            badge="새는돈"
          />
          <FeatureCard
            title="팀·모임 회고 확장"
            description="개인 회고 구조를 팀·스터디·커뮤니티 단위로 확장할 수 있는 설계를 준비하고 있습니다."
            badge="Team"
          />
        </div>
      </div>
    </Section>
  );
}

function StoriesSection() {
  return (
    <Section
      id="stories"
      eyebrow="Stories"
      title="숫자와 사례로 보는 회고리즘"
      description="9주 동안의 회고 챌린지와 실험 스터디에서, 사람들은 실제로 무엇이 달라졌는지 기록으로 남겼습니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] lg:items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              value="24명"
              label="누적 참여자"
              detail="회고 실험 스터디·9주 챌린지 기준"
            />
            <StatCard
              value="92%"
              label="만족·매우 만족"
              detail="참여 후 만족도 응답 비율"
            />
            <StatCard
              value="86%"
              label="행동 변화 체감"
              detail="“실제 행동이 바뀌었다” 응답 비율"
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            참여자들은 “회고를 잘 쓰는 법”보다 “무엇을 줄이고, 무엇을 늘려야 하는지
            감이 생겼다”는 점을 가장 크게 이야기했습니다. 회고리즘은 그런 변화가
            일어나는 최소 구조만 남기고 설계했습니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TestimonialCard
            name="6년 차 개발자"
            role="개인 회고·에너지 회고 사용"
            quote="그냥 피곤하다고만 생각했는데, ‘에너지를 빼앗는 일’만 모아보니 회의 참석 방식을 바꾸게 됐어요."
            tag="에너지 패턴"
          />
          <TestimonialCard
            name="이직 준비 기획자"
            role="감정 회고 사용"
            quote="막연히 불안하다고만 느꼈는데, 반복해서 피하는 일이 뭔지 보이니까 선택이 조금 덜 흔들렸습니다."
            tag="감정 패턴"
          />
          <TestimonialCard
            name="프리랜서 디자이너"
            role="새는돈 회고 사용"
            quote="가계부는 세 번 실패했는데, 회고 형식으로 쓰니까 처음으로 6주를 채웠고, 불필요한 구독을 정리했어요."
            tag="새는돈 회고"
          />
        </div>
      </div>
    </Section>
  );
}

function ProgramsSection() {
  return (
    <Section
      id="programs"
      eyebrow="Programs"
      title="혼자 쓰지 않도록, 함께 회고하는 구조도 준비했습니다."
      description="챌린지·워크숍·조용한 온라인 커뮤니티까지, 회고를 혼자서만 버티지 않아도 되도록 설계합니다."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProgramCard
          title="9주 회고 챌린지"
          tag="온라인 · 그룹"
          desc="매주 한 번, 정해진 시간에 회고를 쓰고 서로 인증합니다. ‘혼자라면 포기했을 순간’을 통과하게 해주는 장치입니다."
          meta="누적 2기 운영 · 새는돈 회고, 감정 회고 기반"
        />
        <ProgramCard
          title="회고 워크숍"
          tag="온·오프라인"
          desc="각자 다른 삶이나 일을 하고 있어도, 회고 구조는 함께 뜯어볼 수 있습니다. 본인에게 맞는 회고 프레임을 같이 찾습니다."
          meta="실제 사례 기반 실습 · 회고 구조 피드백"
        />
        <ProgramCard
          title="조용한 온라인 커뮤니티"
          tag="Slack · 비공개"
          desc="글을 많이 써야 하는 공간이 아니라, 다른 사람의 회고를 보면서 내 감정을 조금 떨어져 보는 공간을 지향합니다."
          meta="도입 준비 중 · 얼리 액세스 모집 예정"
        />
      </div>
    </Section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 pt-6 text-[11px] text-slate-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} 회고리즘 · ThinkBack AI</span>
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:text-slate-300">
            이용약관
          </a>
          <a href="#" className="hover:text-slate-300">
            개인정보 처리방침
          </a>
          <a href="mailto:contact@thinkback.ai" className="hover:text-slate-300">
            문의하기
          </a>
        </div>
      </div>
    </footer>
  );
}
