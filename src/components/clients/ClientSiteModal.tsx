import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClientSite } from './types';
import { X, Check, MapPin, Building2, User, Phone, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface ClientSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: ClientSite) => void;
  clientId: string;
}

export function ClientSiteModal({ isOpen, onClose, onSave, clientId }: ClientSiteModalProps) {
  const [formData, setFormData] = useState<Partial<ClientSite>>({
    name: '',
    type: 'Agence',
    address: '',
    city: '',
    installedEquipments: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: 'Agence',
        address: '',
        city: '',
        installedEquipments: 0
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        onSave({
          ...formData,
          id: `site-${Math.random().toString(36).substr(2, 9)}`,
          installedEquipments: 0
        } as ClientSite);
        setShowSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  if (!isOpen && !showSuccess) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl flex flex-col overflow-hidden z-10"
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Site ajouté avec succès</h3>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Ajouter un site</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Nouveau point de service / installation</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Nom du site</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Agence Ouest, Entrepôt Principal..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white uppercase tracking-tight"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Type de site</label>
                <CustomSelect 
                  value={formData.type || 'Agence'}
                  onChange={(val) => setFormData({...formData, type: val as any})}
                  options={[
                    { value: 'Siège', label: 'SIÈGE' },
                    { value: 'Agence', label: 'AGENCE' },
                    { value: 'Hôtel', label: 'HÔTEL' },
                    { value: 'Entrepôt', label: 'ENTREPÔT' },
                    { value: 'Chantier', label: 'CHANTIER' }
                  ]}
                  className="h-11 font-bold text-xs tracking-wider"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Ville</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Alger, Oran..."
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Adresse complète</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                   className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-xs font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="relative px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  {isSubmitting ? 'Installation...' : 'Ajouter le site'}
                </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
