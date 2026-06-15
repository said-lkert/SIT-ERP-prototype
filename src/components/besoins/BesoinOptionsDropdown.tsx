import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, CheckCircle2, Lock, 
  UserPlus, RefreshCw, Send, CheckSquare, 
  XCircle, History, Archive, ChevronRight,
  TrendingUp, Truck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Besoin } from './types';

interface BesoinOptionsDropdownProps {
  besoin: Besoin;
  onAction: (action: string) => void;
}

export function BesoinOptionsDropdown({ besoin, onAction }: BesoinOptionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    { id: 'validate', label: 'Valider le besoin', icon: CheckCircle2, color: 'text-emerald-500', disabled: ['Validé', 'Couvert', 'Consommé'].includes(besoin.status) },
    { id: 'reserve', label: 'Réserver les produits', icon: Lock, color: 'text-indigo-500', disabled: !besoin.products.length || besoin.status === 'Brouillon' },
    { id: 'assign', label: 'Affecter les services', icon: UserPlus, color: 'text-blue-500', disabled: !besoin.services.length || besoin.status === 'Brouillon' },
    { id: 'substitute', label: 'Proposer une substitution', icon: RefreshCw, color: 'text-amber-500' },
    { id: 'transmit', label: 'Transmettre appro.', icon: Send, color: 'text-purple-500', disabled: !besoin.products.some(p => p.missingQty > 0) },
    { id: 'consume', label: 'Marquer consommé', icon: CheckSquare, color: 'text-emerald-600', disabled: besoin.status !== 'Couvert' && besoin.status !== 'Validé' },
    { type: 'divider' },
    { id: 'cancel', label: 'Annuler le besoin', icon: XCircle, color: 'text-red-500' },
    { id: 'history', label: 'Historique des changements', icon: History, color: 'text-slate-500' },
    { id: 'archive', label: 'Archiver', icon: Archive, color: 'text-slate-400' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-50 py-2"
          >
            {actions.map((action, idx) => {
              if (action.type === 'divider') {
                return <div key={`div-${idx}`} className="h-px bg-slate-100 dark:bg-slate-800 my-1" />;
              }

              const Icon = action.icon!;
              return (
                <button
                  key={action.id}
                  disabled={action.disabled}
                  onClick={() => {
                    onAction(action.id!);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all",
                    action.disabled 
                      ? "opacity-40 cursor-not-allowed bg-transparent text-slate-400" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4", action.color)} />
                  {action.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
