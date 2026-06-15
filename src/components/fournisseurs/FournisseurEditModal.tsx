import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fournisseur } from './types';
import { X, Check, AlertCircle, Building2, User, Phone, Mail, Globe, Clock, CreditCard, Activity, Copy, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface FournisseurEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fournisseur: Fournisseur;
  onSave: (updatedFournisseur: Fournisseur) => void;
  mode?: 'edit' | 'duplicate';
}

const TYPE_OPTIONS = [
  { value: 'Distributeur', label: 'Distributeur' },
  { value: 'Fabricant', label: 'Fabricant' },
  { value: 'Grossiste', label: 'Grossiste' },
  { value: 'Revendeur', label: 'Revendeur' },
  { value: 'Filiale', label: 'Filiale' },
];

const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archive', label: 'Archivé' },
];

const PAYMENT_OPTIONS = [
  { value: 'Virement bancaire (45 jours)', label: 'Virement bancaire (45 jours)' },
  { value: 'Virement bancaire (30 jours)', label: 'Virement bancaire (30 jours)' },
  { value: 'Virement (60 jours)', label: 'Virement (60 jours)' },
  { value: 'Chèque à réception', label: 'Chèque à réception' },
  { value: 'Chèque', label: 'Chèque' },
  { value: 'Paiement comptant', label: 'Paiement comptant' },
  { value: 'LC', label: 'LC' },
];

export function FournisseurEditModal({ isOpen, onClose, fournisseur, onSave, mode = 'edit' }: FournisseurEditModalProps) {
  const [formData, setFormData] = useState<Partial<Fournisseur>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'duplicate') {
        const duplicated = { 
          ...fournisseur, 
          reference: `${fournisseur.reference}-COPY`,
          id: `f-${Math.random().toString(36).substr(2, 9)}`,
          produitsAssocies: 0,
          commandesAttente: 0,
          receptions: []
        };
        setFormData(duplicated);
      } else {
        setFormData({ ...fournisseur });
      }
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, fournisseur, mode]);

  useEffect(() => {
    // Check if anything changed compared to the initial state of this modal session
    if (mode === 'duplicate') {
      // For duplication, we compare against the original supplier
      const isChanged = Object.keys(formData).some(key => {
        if (key === 'id' || key === 'reference' || key === 'produitsAssocies' || key === 'commandesAttente' || key === 'receptions') return false;
        return formData[key as keyof Fournisseur] !== fournisseur[key as keyof Fournisseur];
      }) || formData.reference !== `${fournisseur.reference}-COPY`;
      setHasChanges(isChanged);
    } else {
      const isChanged = Object.keys(formData).some(key => formData[key as keyof Fournisseur] !== fournisseur[key as keyof Fournisseur]);
      setHasChanges(isChanged);
    }
  }, [formData, fournisseur, mode]);

  const handleChange = (field: keyof Fournisseur, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = 'Requis';
    if (!formData.reference?.trim()) newErrors.reference = 'Requise';
    if (!formData.type) newErrors.type = 'Requis';
    if (!formData.email?.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.telephone?.trim()) newErrors.telephone = 'Requis';

    if (mode === 'duplicate' && !hasChanges) {
      newErrors.form = 'Veuillez modifier au moins une information pour dupliquer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ ...fournisseur, ...formData } as Fournisseur);
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {mode === 'duplicate' ? <Copy className="w-5 h-5 text-indigo-500" /> : <Edit className="w-5 h-5 text-indigo-500" />}
                  {mode === 'duplicate' ? 'Dupliquer le fournisseur' : 'Modifier le fournisseur'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {mode === 'duplicate' ? 'Nouvelle entité basée sur ' : ''}{fournisseur.name}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {mode === 'duplicate' && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-800 dark:text-indigo-300">
                    Pour dupliquer ce fournisseur, vous devez modifier au moins une information (le nom ou la référence par exemple).
                  </p>
                </div>
              )}

              {/* SECTION 1: IDENTITE */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">1. Identité & Type</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom du fournisseur *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-sm transition-all focus:ring-2",
                          errors.name ? "border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"
                        )}
                        value={formData.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Ex: Hikvision Algérie"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Référence interne *</label>
                    <input 
                      className={cn(
                        "w-full px-4 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-sm transition-all focus:ring-2 font-mono",
                        errors.reference ? "border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"
                      )}
                      value={formData.reference || ''}
                      onChange={e => handleChange('reference', e.target.value)}
                      placeholder="Ex: FRN-HIK-001"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Type de partenaire *</label>
                    <CustomSelect 
                      value={formData.type || ''}
                      onChange={v => handleChange('type', v)}
                      options={TYPE_OPTIONS}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Statut opérationnel</label>
                    <CustomSelect 
                      value={formData.statut || 'actif'}
                      onChange={v => handleChange('statut', v)}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">2. Coordonnées & Contact</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Principal *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-sm transition-all focus:ring-2",
                          errors.contactPrincipale ? "border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"
                        )}
                        value={formData.contactPrincipale || ''}
                        onChange={e => handleChange('contactPrincipale', e.target.value)}
                        placeholder="Prénom Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Téléphone Direct *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-sm transition-all focus:ring-2",
                          errors.telephone ? "border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"
                        )}
                        value={formData.telephone || ''}
                        onChange={e => handleChange('telephone', e.target.value)}
                        placeholder="+213..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Professionnel *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-sm transition-all focus:ring-2",
                          errors.email ? "border-red-500 focus:ring-red-500/10" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10"
                        )}
                        value={formData.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="email@fournisseur.dz"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Localisation (Pays)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={formData.pays || ''}
                        onChange={e => handleChange('pays', e.target.value)}
                        placeholder="Ex: Algérie"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LOGISTIQUE/FINANCE */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">3. Logistique & Finance</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Délai de livraison moyen</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={formData.delaiMoyenLivraison || ''}
                        onChange={e => handleChange('delaiMoyenLivraison', e.target.value)}
                        placeholder="Ex: 5 jours"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mode & Délai de paiement</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <div className="w-full pl-10">
                        <CustomSelect 
                          value={formData.modePaiement || ''}
                          onChange={v => handleChange('modePaiement', v)}
                          options={PAYMENT_OPTIONS}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errors.form && (mode === 'duplicate') && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">{errors.form}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase tracking-widest text-[10px]"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={mode === 'duplicate' && !hasChanges}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2",
                  mode === 'duplicate' && !hasChanges 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                )}
              >
                <Check className="w-4 h-4" />
                {mode === 'duplicate' ? 'Confirmer la duplication' : 'Enregistrer les modifications'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
