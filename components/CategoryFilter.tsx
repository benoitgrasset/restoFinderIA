import React from 'react';
import { Utensils, Euro } from 'lucide-react';

interface Props {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedPrices: string[];
  onTogglePrice: (price: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  selectedPrices,
  onTogglePrice
}) => {
  const prices = ['€', '€€', '€€€', '€€€€'];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 px-4 sm:px-6 bg-white border-b sticky top-[80px] z-10">
      
      {/* Reset / All Button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`
          flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
          ${selectedCategory === null && selectedPrices.length === 0
            ? 'bg-black text-white shadow-md' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        `}
      >
        <Utensils className="w-4 h-4" />
        Tout
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

      {/* Price Filters */}
      {prices.map((price) => (
        <button
          key={price}
          onClick={() => onTogglePrice(price)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${selectedPrices.includes(price)
              ? 'bg-black text-white shadow-md' 
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}
          `}
        >
          {price}
        </button>
      ))}

      <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

      {/* Category Filters */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category === selectedCategory ? null : category)} // Allow deselecting
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${selectedCategory === category 
              ? 'bg-black text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;