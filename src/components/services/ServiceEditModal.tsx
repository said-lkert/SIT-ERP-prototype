import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Service, ServiceStatus } from './types';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface ServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onSave: (updatedService: Service) => void;
  mode?: 'edit' | 'duplicate';
}

const FAMILY_OPTIONS = [
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Réseau', label: 'Réseau' },
  { value: 'Fibre optique', label: 'Fibre optique' },
  { value: 'Contrôle d\'accès', label: 'Contrôle d\'accès' },
  { value: 'Serveurs', label: 'Serveurs' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Support', label: 'Support' },
  { value: 'Formation', label: 'Formation' },
];

const UNIT_OPTIONS = [
  { value: 'Heure', label: 'Heure' },
  { value: 'Jour', label: 'Jour' },
  { value: 'Forfait', label: 'Forfait' },
  { value: 'Mètre', label: 'Mètre' },
  { value: 'Point réseau', label: 'Point réseau' },
  { value: 'Caméra installée', label: 'Caméra installée' },
  { value: 'Équipement configuré', label: 'Équipement configuré' },
  { value: 'Intervention', label: 'Intervention' },
];

const STATUS_OPTIONS: { value: ServiceStatus; label: string }[] = [
  { value: 'Actif', label: 'Actif' },
  { value: 'Obsolète', label: 'Obsolète' },
  { value: 'Désactivé', label: 'Désactivé' },
];

function isIdentical(obj1: any, obj2: any) {
  const keys = ['reference', 'name', 'description', 'family', 'unit', 'status', 'internalCost', 'sellingPrice', 'estimatedDuration', 'conditions'];
  return keys.every(key => obj1[key] === obj2[key]);
}

export function ServiceEditModal({ isOpen, onClose, service, onSave, mode = 'edit' }: ServiceEditModalProps) {
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [skillsInput, setSkillsInput] = useState('');
  const [originalServiceForDuplicate, setOriginalServiceForDuplicate] = useState<Partial<Service> | null>(null);
  
  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'duplicate') {
        const initialDuplicate = { 
          ...service, 
          reference: `${service.reference}-COPY`,
          id: Math.random().toString(36).substr(2, 9) 
        };
        setFormData(initialDuplicate);
        setOriginalServiceForDuplicate(service);
      } else {
        setFormData({ ...service });
        setOriginalServiceForDuplicate(null);
      }
      setSkillsInput(service.requiredSkills?.join(', ') || '');
      setErrors({});
    }
  }, [isOpen, service, mode]);

  const handleChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.reference?.trim()) newErrors.reference = 'Requise';
    if (!formData.name?.trim()) newErrors.name = 'Requis';
    if (!formData.family) newErrors.family = 'Requise';
    if (formData.sellingPrice === undefined || formData.sellingPrice < 0) newErrors.sellingPrice = 'Invalide';
    if (formData.internalCost === undefined || formData.internalCost < 0) newErrors.internalCost = 'Invalide';
    
    if (mode === 'duplicate' && originalServiceForDuplicate) {
      const currentSkills = skillsInput.split(',').map(t => t.trim()).filter(Boolean);
      const originalSkills = originalServiceForDuplicate.requiredSkills || [];
      
      const skillsMatch = currentSkills.length === originalSkills.length && currentSkills.every((s, i) => s === originalSkills[i]);
      
      if (isIdentical(formData, originalServiceForDuplicate) && skillsMatch) {
         newErrors.global = 'Veuillez modifier au moins une information avant de dupliquer.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const updatedService = {
        ...service,
        ...formData,
        requiredSkills: skillsInput.split(',').map(t => t.trim()).filter(Boolean),
        margin: (formData.sellingPrice || 0) - (formData.internalCost || 0),
        marginRate: formData.internalCost ? (((formData.sellingPrice || 0) - formData.internalCost) / formData.internalCost) * 100 : 0
      } as Service;
      
      onSave(updatedService);
      onClose();
    }
  };

  const handleClose = () => {
    const isDirty = Object.keys(formData).some((k) => formData[k as keyof Service] !== service[k as keyof Service]) || (skillsInput !== (service.requiredSkills?.join(', ') || ''));
    if (isDirty) {
      if (!window.confirm("Des modifications non enregistrées seront perdues. Continuer ?")) {
        return;
      }
    }
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'duplicate' ? 'Dupliquer le service' : 'Modifier le service'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{service.reference} - {service.name}</p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {mode === 'duplicate' && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-start gap-3 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                  <span className="font-bold">Mode Duplication :</span> Pour dupliquer ce service, vous devez modifier au moins une information. Deux services ne peuvent pas être strictement identiques.
                </p>
              </div>
            )}

            {errors.global && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 mb-2 animate-shake">
                <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  {errors.global}
                </p>
              </div>
            )}
            
            {/* Sec 1: Informations générales */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Informations générales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Référence <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.reference || ''}
                    onChange={e => handleChange('reference', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                      errors.reference ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                  />
                  {errors.reference && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.reference}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom du service <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                      errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.name}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description (visible devis/facture)</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Sec 2: Classification & Tarification */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Classification & Tarification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Famille <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    value={formData.family || ''}
                    onChange={v => handleChange('family', v)}
                    options={FAMILY_OPTIONS}
                    className={errors.family ? "!border-red-300" : ""}
                  />
                  {errors.family && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.family}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unité de facturation</label>
                  <CustomSelect 
                    value={formData.unit || ''}
                    onChange={v => handleChange('unit', v)}
                    options={UNIT_OPTIONS}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Statut commercial</label>
                  <CustomSelect 
                    value={formData.status || ''}
                    onChange={v => handleChange('status', v as ServiceStatus)}
                    options={STATUS_OPTIONS}
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1.5 ml-1">Coût interne (HT) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.internalCost || 0}
                      onChange={e => handleChange('internalCost', parseFloat(e.target.value))}
                      className={cn(
                        "w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.internalCost ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                      )}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-bold">DA</span>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Prix de vente (HT) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice || 0}
                      onChange={e => handleChange('sellingPrice', parseFloat(e.target.value))}
                      className={cn(
                        "w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.sellingPrice ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-bold">DA</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 3: Exécution terrain */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Exécution terrain</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Durée estimée</label>
                  <input 
                    type="text" 
                    value={formData.estimatedDuration || ''}
                    onChange={e => handleChange('estimatedDuration', e.target.value)}
                    placeholder="ex: 2 heures"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Compétences nécessaires</label>
                  <input 
                    type="text" 
                    placeholder="Réseau, Fibre, Habilitation..."
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Conditions & Remarques</label>
                  <textarea 
                    value={formData.conditions || ''}
                    onChange={e => handleChange('conditions', e.target.value)}
                    rows={2}
                    placeholder="Instructions spécifiques..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Check className="w-4 h-4" /> {mode === 'duplicate' ? 'Dupliquer le service' : 'Enregistrer les modifications'}
            </button>
          </div>

        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
