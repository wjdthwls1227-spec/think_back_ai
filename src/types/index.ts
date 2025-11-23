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