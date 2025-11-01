export interface RetrospectiveEntry {
  id: string;
  date: string;
  type: 'KPT' | 'PMI' | 'FREE';
  content: KPTContent | PMIContent | FreeContent;
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

export interface FreeContent {
  text: string;
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
  role: 'owner' | 'member';
  createdAt: string;
}