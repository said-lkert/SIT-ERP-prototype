import React from 'react';
import { X, Clock, CheckCircle2, RefreshCw, Archive, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { HistoryEvent } from './types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEvent[];
}

export function HistorySidebar({ isOpen, onClose, history }: HistorySidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800"
      >
        <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Historique complet</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Timeline des modifications</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="relative space-y-10 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-slate-200 dark:before:via-slate-800 dark:before:to-slate-800">
            {history.map((event) => (
              <div key={event.id} className="relative flex items-start group">
                <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-lg group-hover:scale-110 transition-transform">
                   <EventIcon type={event.type} />
                </div>
                <div className="flex-1 pt-0.5 ml-12">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{event.type}</span>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                      <Clock className="w-3 h-3" /> {event.date}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{event.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[8px] font-black text-indigo-600">
                         {event.user.charAt(0)}
                       </div>
                       <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase truncate">{event.user}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case 'Création': return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
    case 'Modification': return <RefreshCw className="w-4 h-4 text-amber-500" />;
    case 'Validation': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'Substitution': return <RefreshCw className="w-4 h-4 text-purple-500" />;
    case 'Annulation': return <Trash2 className="w-4 h-4 text-red-500" />;
    case 'Transmission': return <Send className="w-4 h-4 text-blue-500" />;
    case 'Archivage': return <Archive className="w-4 h-4 text-slate-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}
