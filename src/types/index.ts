export interface RetrospectiveEntry {
  id: string;
  date: string;
  type: 'KPT' | 'PMI' | 'FREE' | '4L';
  content: KPTContent | PMIContent | FreeContent | FourLContent;
  createdAt: string;
  updatedAt: string;
}

export interface KPTContent {
  keep: string[];
  problem: string[];
  try: string[];
}

export interface PMIContent {
  plus: string[];
  minus: string[];
  interesting: string[];
}

export interface FourLContent {
  liked: string[];
  learned: string[];
  lacked: string[];
  longedFor: string[];
}

export interface FreeBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface FreeContent {
  time?: number;
  version?: string;
  blocks: FreeBlock[];
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  entries: RetrospectiveEntry[];
  aiAnalysis: string;
  insights: string[];
  recommendations: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Journal types
export interface Journal {
  id: string;
  user_id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
  title: string | null;
  content: KPTContent | PMIContent | FreeContent | FourLContent;
  created_at: string;
  updated_at: string;
}

// Report types
export interface ReportAnalysis {
  id: string;
  user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  analysis_result: Record<string, unknown>;
  journal_ids: string[];
  created_at: string;
}

// Content types
export interface Content {
  id: string;
  slug: string;
  type: 'workbook' | 'cohort' | 'bundle';
  title: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  is_published: boolean;
  meta?: Record<string, unknown> | null;
  thumbnail_image_url?: string | null;
  detail_image_url?: string | null;
  created_at: string;
}

// Profile types
export interface Profile {
  id: string;
  email: string;
  name: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role: 'user' | 'admin';
  ai_plan_until?: string | null;
  signup_path?: string | null;
  created_at: string;
  updated_at: string;
}

// Retrospect Tool types
export interface RetrospectTool {
  id: string;
  category: '노트' | '필기구' | '도서' | '디지털' | '기타';
  name: string;
  description?: string | null;
  benefit?: string | null;
  image_url?: string | null;
  link_url: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Community Case types
export interface CommunityCase {
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  category?: string | null;
  is_featured: boolean;
  image_url?: string | null;
  created_at: string;
}

// User Content types
export interface UserContent {
  id: string;
  user_id: string;
  content_id: string;
  progress: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

// Analysis result types
export interface DailyAnalysisResult {
  summary: string;
  keywords: string[];
  highlights: string[];
  emotions: string[];
  learnings: string[];
  tomorrowFocus: string[];
  journalCount: number;
}

export interface WeeklyAnalysisResult {
  summary: string;
  themes: string[];
  achievements: string[];
  challenges: string[];
  insights: string[];
  recommendations: string[];
  journalCount: number;
}

export interface MonthlyAnalysisResult {
  summary: string;
  keyEvents: string[];
  growthAreas: string[];
  patterns: string[];
  goals: string[];
  nextMonthFocus: string[];
  journalCount: number;
}

// Request body types for API routes
export interface UserInfo {
  id: string;
  email: string;
  isAdmin: boolean;
}