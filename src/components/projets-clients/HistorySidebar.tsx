import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Plus, User, FileText, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../../lib/utils';
import { ProjetClient } from './types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projet: ProjetClient;
}

const HISTORY_EVENTS = [
  { id: 1, type: 'creation', label: 'Création du projet', date: '2026-05-10T10:00:00Z', user: 'Yassir Berrada', icon: Plus, color: 'text-emerald-500' },
  { id: 2, type: 'update', label: 'Modification "Description"', date: '2026-05-12T14:30:00Z', user: 'Yassir Berrada', icon: FileText, color: 'text-blue-500' },
  { id: 3, type: 'status', label: 'Passage en "Planifié"', date: '2026-05-15T09:15:00Z', user: 'Système', icon: CheckCircle2, color: 'text-indigo-500' },
  { id: 4, type: 'stock', label: 'Réservation : 12x Caméras IP', date: '2026-05-20T11:00:00Z', user: 'Lucie Durant', icon: Package, color: 'text-amber-500' },
  { id: 5, type: 'document', label: 'Ajout Plan de déploiement.pdf', date: '2026-06-01T16:45:00Z', user: 'Yassir Berrada', icon: FileText, color: 'text-indigo-500' },
  { id: 6, type: 'alert', label: 'Alerte : Retard livraison matériel', date: '2026-06-03T10:30:00Z', user: 'Système', icon: AlertCircle, color: 'text-red-500' },
];

export function HistorySidebar({ isOpen, onClose, projet }: HistorySidebarProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Historique des changements</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{projet.reference}</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="space-y-10">
                    {HISTORY_EVENTS.map(event => (
                      <div key={event.id} className="relative pl-12 group">
                        <div className={cn("absolute left-1 top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 transition-colors group-hover:border-indigo-400")}>
                           <event.icon className={cn("w-2.5 h-2.5", event.color)} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{event.label}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{safeFormatDate(event.date)}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-50 dark:bg-slate-800/50 w-fit px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                              <User className="w-3 h-3" /> {event.user}
                           </div>
                           <p className="text-xs text-slate-500 dark:text-slate-400 italic">"Entrée système générée lors de l'action {event.type}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Footer View */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <button onClick={onClose} className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                 Fermer l'historique
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
