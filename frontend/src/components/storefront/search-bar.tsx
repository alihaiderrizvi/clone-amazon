'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (category !== 'all') {
        params.set('category', category);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      {/* Category Dropdown */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="hidden sm:block h-10 px-2 bg-gray-100 text-gray-700 text-sm border-0 rounded-l-md focus:ring-2 focus:ring-[#F7CA00] focus:outline-none"
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
        <option value="fashion">Fashion</option>
        <option value="home">Home & Kitchen</option>
        <option value="toys">Toys & Games</option>
        <option value="sports">Sports & Outdoors</option>
      </select>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Amazon Clone"
        className="flex-1 h-10 px-3 text-gray-900 placeholder:text-gray-500 border-0 focus:ring-2 focus:ring-[#F7CA00] focus:outline-none sm:rounded-none rounded-l-md"
      />

      {/* Search Button */}
      <button
        type="submit"
        className="h-10 px-4 bg-[#FEBD69] hover:bg-[#F3A847] rounded-r-md focus:ring-2 focus:ring-[#F7CA00] focus:outline-none"
        aria-label="Search"
      >
        <Search className="h-5 w-5 text-gray-800" />
      </button>
    </form>
  );
}
