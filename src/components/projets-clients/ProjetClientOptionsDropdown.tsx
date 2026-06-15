import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Copy, PauseCircle, CheckCircle2, 
  Ban, Clock, Archive, ChevronRight, 
  Share2, Printer, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ProjetClient } from './types';

interface ProjetClientOptionsDropdownProps {
  projet: ProjetClient;
  onDuplicate: (projet: ProjetClient) => void;
  onHold: (projet: ProjetClient) => void;
  onClose: (projet: ProjetClient) => void;
  onCancel: (projet: ProjetClient) => void;
  onHistory: (projet: ProjetClient) => void;
  onArchive: (projet: ProjetClient) => void;
  showLabel?: boolean;
}

export function ProjetClientOptionsDropdown({ 
  projet, 
  onDuplicate, 
  onHold, 
  onClose, 
  onCancel, 
  onHistory, 
  onArchive,
  showLabel = true
}: ProjetClientOptionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Dupliquer le projet', icon: Copy, action: () => onDuplicate(projet), color: 'text-slate-700 dark:text-slate-200' },
    { label: 'Mettre en attente', icon: PauseCircle, action: () => onHold(projet), color: 'text-amber-600 font-semibold' },
    { label: 'Clôturer le projet', icon: CheckCircle2, action: () => onClose(projet), color: 'text-emerald-600 font-semibold' },
    { label: 'Annuler le projet', icon: Ban, action: () => onCancel(projet), color: 'text-red-600 font-semibold' },
    { type: 'divider' },
    { label: 'Historique des changements', icon: Clock, action: () => onHistory(projet), color: 'text-slate-700 dark:text-slate-200' },
    { label: 'Imprimer la fiche', icon: Printer, action: () => window.print(), color: 'text-slate-700 dark:text-slate-200' },
    { label: 'Partager', icon: Share2, action: () => {}, color: 'text-slate-700 dark:text-slate-200' },
    { type: 'divider' },
    { label: 'Archiver le projet', icon: Archive, action: () => onArchive(projet), color: 'text-slate-500' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all duration-200",
          !showLabel && "p-2 px-2"
        )}
      >
        <Settings className="w-4 h-4 text-slate-500" />
        {showLabel && <span>Options</span>}
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-[100] overflow-hidden"
          >
            {menuItems.map((item, index) => (
              item.type === 'divider' ? (
                <div key={`div-${index}`} className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action ? item.action() : null;
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", item.color)} />}
                    <span className={cn("text-xs uppercase tracking-tight", item.color)}>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
