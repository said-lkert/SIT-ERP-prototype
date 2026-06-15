import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Lock, ListChecks, Barcode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StockItem } from './types';
import { mockStockData } from './mockData';
import { CustomSelect } from '../ui/CustomSelect';
import { useModules } from '../../contexts/ModuleContext';

interface StockActionModalProps {
  isOpen: boolean;
  action: 'entree' | 'sortie' | 'transfert' | 'resever' | 'correction' | null;
  onClose: () => void;
  initialProduct?: StockItem;
}

export function StockActionModal({ isOpen, action, onClose, initialProduct }: StockActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    destLocation: '',
    originLocation: '',
    location: '',
    motif: '',
    reason: '',
    responsible: ''
  });

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) setSelectedProductId(initialProduct.id);
      else setSelectedProductId('');
      setIsDirty(false);
    }
  }, [isOpen, initialProduct]);

  if (!action) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'entree': return { 
        title: 'Entrée en stock', 
        description: 'Ajoute une quantité physique dans un emplacement de stock.',
        icon: <ArrowDownToLine className="w-5 h-5 text-emerald-500" />, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
      };
      case 'sortie': return { 
        title: 'Sortie de stock', 
        description: 'Retire une quantité disponible pour une intervention, un projet ou une consommation interne.',
        icon: <ArrowUpFromLine className="w-5 h-5 text-rose-500" />, 
        color: 'text-rose-500', 
        bg: 'bg-rose-50 dark:bg-rose-900/20' 
      };
      case 'transfert': return { 
        title: 'Transfert de stock', 
        description: 'Déplace une quantité d’un emplacement vers un autre sans changer le stock global.',
        icon: <ArrowRightLeft className="w-5 h-5 text-blue-500" />, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/20' 
      };
      case 'resever': return { 
        title: 'Réserver du matériel', 
        description: 'Bloque une quantité disponible pour un projet, un client ou une intervention prévue.',
        icon: <Lock className="w-5 h-5 text-amber-500" />, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50 dark:bg-amber-900/20' 
      };
      case 'correction': return { 
        title: 'Correction Inventaire', 
        description: 'Ajuste la quantité réelle après inventaire ou contrôle terrain, avec justification obligatoire.',
        icon: <ListChecks className="w-5 h-5 text-slate-500" />, 
        color: 'text-slate-500', 
        bg: 'bg-slate-50 dark:bg-slate-900/20' 
      };
    }
  };

  const details = getActionDetails();

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm("Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?")) {
        return;
      }
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("Veuillez sélectionner un produit.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsDirty(false);
      onClose();
    }, 800);
  };

  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const selectedProduct = mockStockData.find(p => p.id === selectedProductId);
  const isSerialized = selectedProduct?.isSerialized && serialNumbersEnabled;

  const productOptions = mockStockData.map(p => ({
    value: p.id,
    label: `${p.reference} - ${p.name}`
  }));

  const locationOptions = [
    { value: 'depot', label: 'Dépôt principal' },
    { value: 'veh_a', label: 'Véhicule Technicien A' },
    { value: 'veh_b', label: 'Véhicule Technicien B' },
    { value: 'retour', label: 'Zone retour fournisseur' },
    { value: 'chantier', label: 'Chantier X' },
    { value: 'reparation', label: 'Zone Réparation' },
  ];

  const motifOptions = [
    { value: 'chantier', label: 'Installation / Chantier / Client' },
    { value: 'perte', label: 'Perte' },
    { value: 'casse', label: 'Casse / Défectueux' },
    { value: 'autre', label: 'Autre' },
  ];

  const reasonOptions = [
    { value: 'inventaire', label: 'Inventaire périodique' },
    { value: 'perte', label: 'Perte constatée' },
    { value: 'erreur', label: 'Erreur de saisie précédente' },
    { value: 'casse', label: 'Casse non déclarée' },
  ];

  const responsibleOptions = [
    { value: 'tech_a', label: 'Marc Tech' },
    { value: 'chef_b', label: 'Jean Dupont' },
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => handleClose()}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${details.bg}`}>
                  {details.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">{details.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{details.description}</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form id="stock-action-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Select Product */}
                <div className="z-50 relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produit concerné *</label>
                  <CustomSelect 
                    value={selectedProductId} 
                    onChange={(val) => { setSelectedProductId(val); setIsDirty(true); }}
                    options={productOptions}
                    placeholder="Sélectionnez un produit..."
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {action === 'correction' ? 'Quantité réelle constatée *' : 'Quantité *'}
                    </label>
                    <input 
                      type="number" min="1" required 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors" 
                      placeholder="Ex: 5"
                      onChange={() => setIsDirty(true)}
                    />
                  </div>

                 {/* Dynamic Origin / Dest depending on action */}
                 {action === 'entree' && (
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement destination *</label>
                      <CustomSelect 
                        value={formData.destLocation} 
                        onChange={(val) => updateForm('destLocation', val)} 
                        options={locationOptions} 
                        placeholder="Sélectionnez..."
                        className="w-full"
                      />
                    </div>
                 )}
                 {action === 'sortie' && (
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origine *</label>
                      <CustomSelect 
                        value={formData.originLocation} 
                        onChange={(val) => updateForm('originLocation', val)} 
                        options={locationOptions} 
                        placeholder="Sélectionnez..."
                        className="w-full"
                      />
                    </div>
                 )}
                 {action === 'correction' && (
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement *</label>
                      <CustomSelect 
                        value={formData.location} 
                        onChange={(val) => updateForm('location', val)} 
                        options={locationOptions} 
                        placeholder="Sélectionnez..."
                        className="w-full"
                      />
                    </div>
                 )}
                </div>

                {action === 'transfert' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement source *</label>
                      <CustomSelect 
                        value={formData.originLocation} 
                        onChange={(val) => updateForm('originLocation', val)} 
                        options={locationOptions} 
                        placeholder="Sélectionnez..."
                        className="w-full"
                      />
                    </div>
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement destination *</label>
                      <CustomSelect 
                        value={formData.destLocation} 
                        onChange={(val) => updateForm('destLocation', val)} 
                        options={locationOptions} 
                        placeholder="Sélectionnez..."
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Specifics per action */}
                {action === 'sortie' && (
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif de sortie *</label>
                    <CustomSelect 
                      value={formData.motif} 
                      onChange={(val) => updateForm('motif', val)} 
                      options={motifOptions} 
                      placeholder="Sélectionnez..."
                      className="w-full"
                    />
                  </div>
                )}

                {action === 'correction' && (
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Raison de la correction *</label>
                    <CustomSelect 
                      value={formData.reason} 
                      onChange={(val) => updateForm('reason', val)} 
                      options={reasonOptions} 
                      placeholder="Sélectionnez..."
                      className="w-full"
                    />
                  </div>
                )}

                {action === 'resever' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lié au projet / Devis / Intervention *</label>
                      <input type="text" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Ex: Déploiement Hôtel Horizon" onChange={() => setIsDirty(true)}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date prévue *</label>
                        <input type="date" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors" onChange={() => setIsDirty(true)}/>
                      </div>
                      <div className="relative z-30">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsable *</label>
                        <CustomSelect 
                          value={formData.responsible} 
                          onChange={(val) => updateForm('responsible', val)} 
                          options={responsibleOptions} 
                          placeholder="Sélectionnez..."
                          className="w-full"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Docs Fields */}
                {(action === 'entree' || action === 'sortie') && (
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Document lié (BL, Facture, Bon Intervention)
                     </label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Optionnel" onChange={() => setIsDirty(true)}/>
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Commentaire {action === 'correction' && '*'}</label>
                    <textarea required={action === 'correction'} rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder={action === 'correction' ? "Justification obligatoire" : "Optionnel"} onChange={() => setIsDirty(true)}></textarea>
                </div>

                {isSerialized && selectedProductId !== '' && (action !== 'resever') && (
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
                      <Barcode className="w-4 h-4" /> Numéros de série (Produit Sérialisé)
                    </div>
                    {action === 'entree' ? (
                      <textarea rows={3} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Scannez ou collez les numéros de série (un par ligne)"></textarea>
                    ) : (
                      <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">La sélection des numéros de série se fera à l'étape suivante après vérification de la quantité.</p>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleClose}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                form="stock-action-form"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white shadow-sm rounded-lg transition-colors flex items-center gap-2 ${
                  action === 'entree' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  action === 'sortie' ? 'bg-rose-600 hover:bg-rose-700' :
                  action === 'transfert' ? 'bg-blue-600 hover:bg-blue-700' :
                  action === 'resever' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
              >
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enregistrement...</>
                ) : (
                  <>Confirmer l'action</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
