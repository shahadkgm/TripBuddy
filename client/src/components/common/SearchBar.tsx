import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
}

export const SearchBar = ({ placeholder = "Search...", onSearch, className = "" }: SearchBarProps) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5537ee] transition-all"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};