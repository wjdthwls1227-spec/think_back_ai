import type { JSX } from 'react';
import type { FreeBlock, FreeContent } from '@/types';
import { normalizeFreeContent } from '@/lib/utils';

interface FreeContentViewerProps {
  content: FreeContent | null | undefined;
}

const headerLevelClass: Record<number, string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-bold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-semibold',
  5: 'text-base font-semibold',
  6: 'text-base font-semibold',
};

function renderBlock(block: FreeBlock, index: number, keyPrefix = '') {
  if (!block || !block.type) {
    return null;
  }

  const data = block.data ?? {};
  const key = `${keyPrefix}${index}`;

  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={key}
          className="text-sm leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: (data as { text?: string }).text ?? '' }}
        />
      );
    case 'header': {
      const level = Math.min(Math.max(Number((data as { level?: number }).level ?? 2), 1), 6);
      const className = headerLevelClass[level] ?? headerLevelClass[2];

      const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;

      return (
        <Tag
          key={key}
          className={`${className} text-gray-900`}
          dangerouslySetInnerHTML={{ __html: (data as { text?: string }).text ?? '' }}
        />
      );
    }
    case 'list': {
      const { style = 'unordered', items = [] } = data as { style?: 'ordered' | 'unordered'; items?: string[] };
      const ListTag = style === 'ordered' ? 'ol' : ('ul' as const);

      return (
        <ListTag
          key={key}
          className={style === 'ordered' ? 'list-decimal list-inside space-y-1 text-gray-700 text-sm' : 'list-disc list-inside space-y-1 text-gray-700 text-sm'}
        >
          {items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      );
    }
    case 'checklist': {
      const { items = [] } = data as { items?: { text: string; checked: boolean }[] };

      return (
        <ul key={key} className="space-y-2">
          {items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="flex items-start gap-3 text-sm text-gray-700">
              <span
                className={`mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                  item.checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white'
                }`}
              >
                {item.checked && '✓'}
              </span>
              <span dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
            </li>
          ))}
        </ul>
      );
    }
    case 'table': {
      const { content = [] } = data as { content?: string[][] };

      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {content.map((row, rowIndex) => (
                <tr key={`${key}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${key}-row-${rowIndex}-cell-${cellIndex}`}
                      className="border border-gray-200 px-3 py-2 align-top text-gray-700"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-blue-200 bg-blue-50 px-4 py-3 text-sm italic text-blue-900"
          dangerouslySetInnerHTML={{ __html: (data as { text?: string }).text ?? '' }}
        />
      );
    case 'toggle': {
      const { label, title, content } = data as {
        label?: string;
        title?: string;
        content?: FreeContent | { blocks?: FreeBlock[] };
      };

      const nested = normalizeFreeContent(content as FreeContent);

      return (
        <details
          key={key}
          className="rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3"
        >
          <summary
            className="cursor-pointer text-sm font-medium text-amber-900"
            dangerouslySetInnerHTML={{ __html: label ?? title ?? '토글' }}
          />
          <div className="mt-3 space-y-3 border-l border-amber-200 pl-4 text-gray-700">
            {nested.blocks.length === 0
              ? <p className="text-xs text-gray-500">토글 내용을 추가하세요.</p>
              : nested.blocks.map((nestedBlock, nestedIndex) => renderBlock(nestedBlock, nestedIndex, `${key}-`))}
          </div>
        </details>
      );
    }
    default:
      return null;
  }
}

export function FreeContentViewer({ content }: FreeContentViewerProps) {
  const normalized = normalizeFreeContent(content);

  if (!normalized.blocks.length) {
    return <p className="text-sm text-gray-500">작성된 내용이 없습니다.</p>;
  }

  return <div className="space-y-4">{normalized.blocks.map((block, index) => renderBlock(block, index))}</div>;
}

