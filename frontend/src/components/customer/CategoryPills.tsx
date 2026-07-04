import React from 'react';
import { Category } from '../../types';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className="flex gap-2 overflow-x-auto py-3 px-6 no-scrollbar scroll-smooth bg-white border-b border-gray-50">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
          selectedCategoryId === null
            ? 'bg-emerald-800 border-emerald-800 text-white shadow-sm shadow-emerald-800/10'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
      >
        All Menu
      </button>

      {activeCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
            selectedCategoryId === category.id
              ? 'bg-emerald-800 border-emerald-800 text-white shadow-sm shadow-emerald-800/10'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
