'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';

const CATEGORIES = ['전체', '회고정보', '커뮤니티소식', '회고 사례', '기타'] as const;

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto">
      <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategory === category
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

