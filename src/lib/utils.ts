import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FreeContent, FreeBlock } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function blockToPlainText(block: FreeBlock): string {
  if (!block || !block.type) {
    return '';
  }

  const data = block.data ?? {};

  switch (block.type) {
    case 'paragraph':
    case 'header':
      return typeof data?.text === 'string'
        ? data.text.replace(/<[^>]*>/g, '')
        : '';
    case 'list':
      return Array.isArray((data as { items?: unknown[] }).items)
        ? ((data as { items: string[] }).items || []).join(' ')
        : '';
    case 'checklist':
      return Array.isArray((data as { items?: { text: string }[] }).items)
        ? ((data as { items: { text: string }[] }).items || [])
            .map(item => item.text ?? '')
            .join(' ')
        : '';
    case 'table':
      if (Array.isArray((data as { content?: string[][] }).content)) {
        return ((data as { content: string[][] }).content || [])
          .flat()
          .join(' ');
      }
      return '';
    case 'quote':
      return typeof (data as { text?: string }).text === 'string'
        ? (data as { text: string }).text
        : '';
    case 'toggle': {
      const { label, title, content } = data as {
        label?: string;
        title?: string;
        content?: FreeContent | { blocks?: FreeBlock[] };
      };

      const nested = normalizeFreeContent(content as FreeContent);
      const nestedText = nested.blocks.map(blockToPlainText).join(' ');

      return [label ?? title ?? '', nestedText].filter(Boolean).join(' ').trim();
    }
    default:
      return '';
  }
}

export function normalizeFreeContent(
  content?: FreeContent | { text?: string } | string | null,
): FreeContent {
  if (content && typeof content === 'object' && Array.isArray((content as FreeContent).blocks)) {
    return content as FreeContent;
  }

  if (content && typeof (content as { text?: unknown }).text === 'string') {
    return {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: { text: (content as { text: string }).text },
        },
      ],
    };
  }

  if (typeof content === 'string') {
    return {
      time: Date.now(),
      blocks: [
        {
          type: 'paragraph',
          data: { text: content },
        },
      ],
    };
  }

  return {
    time: Date.now(),
    blocks: [],
  };
}

export function extractPlainTextFromFreeContent(
  content?: FreeContent | { text?: string } | string | null,
): string {
  const normalized = normalizeFreeContent(content);

  if (!normalized.blocks.length) {
    return '';
  }

  return normalized.blocks.map(blockToPlainText).join(' ').trim();
}