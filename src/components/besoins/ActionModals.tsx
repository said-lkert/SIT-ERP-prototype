import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Check, AlertCircle, RefreshCw, 
  Trash2, Send, Lock, UserPlus, 
  TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { Besoin, Substitution } from './types';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void;
  title: string;
  description: string;
  icon: any;
  color: string;
}

export function ActionModal({ isOpen, onClose, onConfirm, title, description, icon: Icon, color, children }: ActionModalProps & { children?: React.ReactNode }) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg", color)}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
              </div>
            </div>
            
            <div className="mt-6">
              {children}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
            >
              Annuler
            </button>
            <button 
              onClick={() => onConfirm()}
              className={cn("px-6 py-2 rounded-xl text-white font-bold uppercase tracking-widest text-xs shadow-lg transition-all", color === 'bg-red-500' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20')}
            >
              Confirmer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export function CancellationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(reason)}
      title="Annuler le besoin"
      description="L'annulation libérera automatiquement toutes les réservations de stock et affectations de ressources."
      icon={XCircleIcon}
      color="bg-red-500"
    >
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Motif de l'annulation (obligatoire)</label>
      <textarea 
        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
        placeholder="Expliquez pourquoi ce besoin est annulé..."
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </ActionModal>
  );
}

export function SubstitutionModal({ isOpen, onClose, onConfirm, besoin }: { isOpen: boolean, onClose: () => void, onConfirm: (sub: Substitution) => void, besoin: Besoin }) {
  const [sub, setSub] = useState<Partial<Substitution>>({
    type: 'Équivalent',
    impactCost: 'Neutre',
    impactDelay: 'Neutre',
    compliance: 'Conforme'
  });

  const productOptions = besoin.products.map(p => ({ value: p.label, label: p.label }));

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(sub as Substitution)}
      title="Substitution de ressource"
      description="Proposez une alternative pour pallier un manque de stock ou de disponibilité."
      icon={RefreshCw}
      color="bg-amber-500"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Élément original</label>
          <CustomSelect 
            options={productOptions}
            value={sub.originalLabel || ''}
            onChange={(v) => setSub({...sub, originalLabel: v})}
          />
        </div>
        <div className="flex items-center gap-3 justify-center py-1">
           <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
           <ArrowRight className="w-4 h-4 text-amber-500" />
           <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Substitut proposé</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="Nom du substitut..."
            value={sub.substitutedLabel || ''}
            onChange={(e) => setSub({...sub, substitutedLabel: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Raison</label>
             <input 
               type="text"
               className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none"
               placeholder="Ex: Rupture fournisseur"
               value={sub.reason || ''}
               onChange={(e) => setSub({...sub, reason: e.target.value})}
             />
           </div>
           <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Impact Coût</label>
             <CustomSelect 
               options={[{value: 'Neutre', label: 'Neutre'}, {value: 'Augmentation', label: 'Augmentation'}, {value: 'Diminution', label: 'Diminution'}]}
               value={sub.impactCost || 'Neutre'}
               onChange={(v) => setSub({...sub, impactCost: v as any})}
             />
           </div>
        </div>
      </div>
    </ActionModal>
  );
}

function XCircleIcon({ className }: { className: string }) {
  return <X className={className} />;
}
