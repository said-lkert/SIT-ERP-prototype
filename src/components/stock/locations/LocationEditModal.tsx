import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StockLocation, LocationType, LocationStatus } from './types';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';

interface LocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: StockLocation) => void;
  location?: StockLocation;
}

const TYPE_OPTIONS = [
  { value: 'Dépôt', label: 'Dépôt' },
  { value: 'Zone', label: 'Zone' },
  { value: 'Allée', label: 'Allée' },
  { value: 'Rayon', label: 'Rayon' },
  { value: 'Étagère', label: 'Étagère' },
  { value: 'Véhicule', label: 'Véhicule' },
  { value: 'Zone retour', label: 'Zone retour' },
  { value: 'Zone SAV', label: 'Zone SAV' },
  { value: 'Chantier', label: 'Chantier' },
];

const STATUS_OPTIONS: { value: LocationStatus; label: string }[] = [
  { value: 'Actif', label: 'Actif' },
  { value: 'Inactif', label: 'Inactif' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Saturé', label: 'Saturé' },
];

const UNIT_OPTIONS = [
  { value: 'pièces', label: 'Pièces' },
  { value: 'cartons', label: 'Cartons' },
  { value: 'palettes', label: 'Palettes' },
  { value: 'mètres', label: 'Mètres' },
];

const PARENT_OPTIONS = [
  { value: 'loc1', label: 'Dépôt Principal' },
  { value: 'loc2', label: 'Zone Réseau' },
  { value: 'loc7', label: 'Zone Retour Fournisseur' },
];

export function LocationEditModal({ isOpen, onClose, onSave, location }: LocationEditModalProps) {
  const [formData, setFormData] = useState<Partial<StockLocation>>({
    status: 'Actif',
    maxCapacity: 100,
    usedCapacity: 0,
    capacityUnit: 'pièces',
    alertThreshold: 85,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (location) {
        setFormData({ ...location });
      } else {
        setFormData({
          status: 'Actif',
          maxCapacity: 100,
          usedCapacity: 0,
          capacityUnit: 'pièces',
          alertThreshold: 85,
        });
      }
      setErrors({});
    }
  }, [isOpen, location]);

  const handleChange = (field: keyof StockLocation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.reference?.trim()) newErrors.reference = 'Requise';
    if (!formData.name?.trim()) newErrors.name = 'Requis';
    if (!formData.type) newErrors.type = 'Requis';
    if (!formData.manager?.trim()) newErrors.manager = 'Requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const newLocation = {
        ...formData,
        id: formData.id || Math.random().toString(36).substr(2, 9),
        createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
        productsStoredCount: formData.productsStoredCount || 0,
        hasSerializedProducts: formData.hasSerializedProducts || false,
        usedCapacity: formData.usedCapacity || 0,
      } as StockLocation;
      
      onSave(newLocation);
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
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {location ? "Modifier l'emplacement" : "Nouvel emplacement"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {location ? "Mettre à jour les informations de position" : "Définir un nouveau lieu de stockage"}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Sec 1: Identité */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Identité de l'emplacement</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de l'emplacement <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Dépôt Principal, Allée A, Véhicule Tech B..."
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                        errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Référence / Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.reference || ''}
                      onChange={e => handleChange('reference', e.target.value)}
                      placeholder="DEP-MAIN"
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.reference ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    {errors.reference && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.reference}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type <span className="text-red-500">*</span></label>
                    <CustomSelect 
                      value={formData.type || ''}
                      onChange={v => handleChange('type', v as LocationType)}
                      options={TYPE_OPTIONS}
                      className={errors.type ? "!border-red-300" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dépôt / Zone Parent</label>
                    <CustomSelect 
                      value={formData.parentLocationId || ''}
                      onChange={v => {
                        handleChange('parentLocationId', v);
                        const label = PARENT_OPTIONS.find(o => o.value === v)?.label;
                        handleChange('parentLocation', label);
                      }}
                      options={[{ value: '', label: 'Aucun (Racine)' }, ...PARENT_OPTIONS]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Responsable <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.manager || ''}
                      onChange={e => handleChange('manager', e.target.value)}
                      placeholder="Prénom Nom"
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                        errors.manager ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* Sec 2: Capacité */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Capacité & Alerte</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Capacité Max</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.maxCapacity || 0}
                      onChange={e => handleChange('maxCapacity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unité</label>
                    <CustomSelect 
                      value={formData.capacityUnit || 'pièces'}
                      onChange={v => handleChange('capacityUnit', v)}
                      options={UNIT_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Seuil Alerte</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.alertThreshold || 0}
                      onChange={e => handleChange('alertThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* Sec 3: Status & Notes */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Statut & Localisation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Statut initial</label>
                    <CustomSelect 
                      value={formData.status || 'Actif'}
                      onChange={v => handleChange('status', v as LocationStatus)}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ville / Zone Géo</label>
                    <input 
                      type="text" 
                      value={formData.city || ''}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="Alger, Oran..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Adresse complète / Description</label>
                    <textarea 
                      value={formData.address || ''}
                      onChange={e => handleChange('address', e.target.value)}
                      rows={2}
                      placeholder="Précisions sur la localisation physique ou notes de gestion..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" /> {location ? 'Mettre à jour' : 'Créer l\'emplacement'}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
