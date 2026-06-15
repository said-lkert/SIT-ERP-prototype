import React, { ReactNode, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModuleSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode; // Inline filters next to search bar
  advancedFilters?: ReactNode; // Content of the collapsible panel
  activeFiltersCount?: number; // Count of active advanced filters
}

export function ModuleSearchFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  filters,
  advancedFilters,
  activeFiltersCount = 0,
}: ModuleSearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm shrink-0">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
          />
        </div>
        
        {(filters || advancedFilters) && (
          <div className="flex gap-3 flex-wrap lg:flex-nowrap lg:justify-end">
            {filters}
            
            {advancedFilters && (
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg shadow-sm border transition-colors",
                  showAdvanced || activeFiltersCount > 0
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                    : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                )}
              >
                <Filter className="w-4 h-4" /> 
                Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            )}
          </div>
        )}
      </div>
      
      {advancedFilters && showAdvanced && (
        <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200 mt-4">
          {advancedFilters}
        </div>
      )}
    </div>
  );
}
