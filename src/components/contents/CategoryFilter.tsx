'use client';

import { Filter } from 'lucide-react';

const TYPES = ['전체', '워크북', '커뮤니티', '패키지'] as const;
const TYPE_MAP: Record<string, 'workbook' | 'cohort' | 'bundle' | 'all'> = {
  '전체': 'all',
  '워크북': 'workbook',
  '커뮤니티': 'cohort',
  '패키지': 'bundle',
};

export function CategoryFilter({ 
  selectedType, 
  onTypeChange 
}: { 
  selectedType: string;
  onTypeChange: (type: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto">
      <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            selectedType === type
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

