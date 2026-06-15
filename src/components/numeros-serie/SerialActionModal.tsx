import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Upload, ArrowRightLeft, Lock, Wrench, AlertOctagon, RotateCcw, PackagePlus, RefreshCcw, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from '../ui/CustomSelect';
import { SerialNumber } from './types';
import { mockSerialNumbers } from './mockData';
import { mockStockData } from '../stock/mockData';

export type SerialActionType = 'add' | 'import' | 'reserve' | 'transfer' | 'install' | 'breakdown' | 'return_supplier' | 'replace' | 'stock' | 'decommission' | null;

interface SerialActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: SerialActionType;
  initialSerialId?: string;
}

export function SerialActionModal({ isOpen, onClose, action, initialSerialId }: SerialActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedSerialId, setSelectedSerialId] = useState<string>('');
  
  const [formData, setFormData] = useState<Record<string, string>>({
    productId: '',
    serial: '',
    supplier: '',
    entryDate: new Date().toISOString().split('T')[0],
    location: '',
    destLocation: '',
    originLocation: '',
    warrantySupplier: '',
    warrantyClient: '',
    project: '',
    plannedDate: '',
    responsible: '',
    comment: '',
    client: '',
    site: '',
    exactLocation: '',
    installDate: new Date().toISOString().split('T')[0],
    technician: '',
    diagnostic: '',
    gravity: '',
    reason: '',
    newSerial: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialSerialId) {
        setSelectedSerialId(initialSerialId);
      } else {
        setSelectedSerialId('');
      }
      setFormData({
        productId: '',
        serial: '',
        supplier: '',
        entryDate: new Date().toISOString().split('T')[0],
        location: '',
        destLocation: '',
        originLocation: '',
        warrantySupplier: '',
        warrantyClient: '',
        project: '',
        plannedDate: '',
        responsible: '',
        comment: '',
        client: '',
        site: '',
        exactLocation: '',
        installDate: new Date().toISOString().split('T')[0],
        technician: '',
        diagnostic: '',
        gravity: '',
        reason: '',
        newSerial: ''
      });
      setIsDirty(false);
    }
  }, [isOpen, action, initialSerialId]);

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty && !window.confirm("Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?")) {
      return;
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action !== 'add' && action !== 'import' && !selectedSerialId) {
      alert("Veuillez sélectionner un numéro de série.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      // On success, we would normally update state or fetch refetch.
      // We will simulate success with a brief alert or implicit trust.
    }, 800);
  };

  const getTitleInfo = () => {
    switch (action) {
      case 'add': return { title: 'Ajouter un N° de série', icon: PackagePlus, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' };
      case 'import': return { title: 'Importer des N° de série', icon: Upload, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' };
      case 'reserve': return { title: 'Réserver équipement', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'transfer': return { title: 'Transférer équipement', icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'install': return { title: 'Déclarer installé', icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      case 'breakdown': return { title: 'Déclarer en panne', icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' };
      case 'return_supplier': return { title: 'Retour fournisseur', icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'replace': return { title: 'Remplacer équipement', icon: RefreshCcw, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' };
      case 'stock': return { title: 'Remettre en stock', icon: PackagePlus, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      case 'decommission': return { title: 'Mettre hors service', icon: PowerOff, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' };
      default: return { title: 'Action', icon: PackagePlus, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const { title, icon: TitleIcon, color, bg } = getTitleInfo();

  const serialOptions = mockSerialNumbers.map(s => ({
    value: s.id,
    label: `${s.serial} - ${s.productName}`
  }));

  const productOptions = mockStockData.filter(p => p.isSerialized).map(p => ({
    value: p.id,
    label: `${p.reference} - ${p.name}`
  }));

  const locationOptions = [
    { value: 'depot', label: 'Dépôt principal' },
    { value: 'veh_a', label: 'Véhicule Technicien A' },
    { value: 'veh_b', label: 'Véhicule Technicien B' },
    { value: 'chantier', label: 'Chantier X' },
    { value: 'reparation', label: 'Zone Réparation' },
  ];

  const technicianOptions = [
    { value: 'tech_a', label: 'Marc Tech' },
    { value: 'tech_b', label: 'Luc Tech' },
    { value: 'tech_c', label: 'Sam Tech' },
  ];

  const gravityOptions = [
    { value: 'faible', label: 'Faible (Dysfonctionnement mineur)' },
    { value: 'moyenne', label: 'Moyenne (Panne partielle)' },
    { value: 'critique', label: 'Critique (Panne totale)' },
  ];

  const selectedSerial = mockSerialNumbers.find(s => s.id === selectedSerialId);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <TitleIcon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                  {(action !== 'add' && action !== 'import' && selectedSerial) && (
                    <p className="text-sm font-mono text-slate-500">{selectedSerial.serial}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <form id="serial-action-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* SELECT SERIAL COMPONENT (if not Add/Import) */}
                {(action !== 'add' && action !== 'import') && (
                  <div className="relative z-[60]">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numéro de série concerné *</label>
                    <CustomSelect 
                      value={selectedSerialId} 
                      onChange={(val) => { setSelectedSerialId(val); setIsDirty(true); }}
                      options={serialOptions}
                      placeholder="Rechercher un numéro de série..."
                      className="w-full"
                    />
                  </div>
                )}

                {/* --- ADD ACTION --- */}
                {action === 'add' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative z-[50]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produit *</label>
                        <CustomSelect 
                          value={formData.productId} 
                          onChange={(val) => updateForm('productId', val)} 
                          options={productOptions} 
                          placeholder="Sélectionner..." 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numéro de série *</label>
                        <input type="text" required value={formData.serial} onChange={e => updateForm('serial', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono" placeholder="Ex: SN-123456" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fournisseur</label>
                        <input type="text" value={formData.supplier} onChange={e => updateForm('supplier', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Nom fournisseur" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'entrée *</label>
                        <input type="date" required value={formData.entryDate} onChange={e => updateForm('entryDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div className="relative z-[40]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement *</label>
                        <CustomSelect value={formData.location} onChange={(val) => updateForm('location', val)} options={locationOptions} placeholder="Sélectionner..." className="w-full"/>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fin garantie fournisseur</label>
                        <input type="date" value={formData.warrantySupplier} onChange={e => updateForm('warrantySupplier', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fin garantie interne/client</label>
                        <input type="date" value={formData.warrantyClient} onChange={e => updateForm('warrantyClient', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- IMPORT ACTION --- */}
                {action === 'import' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                       <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliquez ou glissez un fichier CSV/Excel</p>
                       <p className="text-xs text-slate-500">Format attendu: Produit | Numéro de série | Emplacement</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                       <span>Télécharger le modèle CSV</span>
                    </div>
                  </div>
                )}

                {/* --- RESERVE ACTION --- */}
                {action === 'reserve' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Projet / Client / Devis *</label>
                        <input type="text" required value={formData.project} onChange={e => updateForm('project', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: PRJ-2024-05" />
                      </div>
                      <div className="relative z-[50]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date prévue *</label>
                        <input type="date" required value={formData.plannedDate} onChange={e => updateForm('plannedDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <div className="relative z-[40]">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsable *</label>
                      <CustomSelect value={formData.responsible} onChange={(val) => updateForm('responsible', val)} options={technicianOptions} placeholder="Sélectionner..." className="w-full"/>
                    </div>
                  </div>
                )}

                {/* --- TRANSFER ACTION --- */}
                {action === 'transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative z-[50]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement source</label>
                        <CustomSelect value={formData.originLocation} onChange={(val) => updateForm('originLocation', val)} options={locationOptions} placeholder="Actuel..." className="w-full"/>
                      </div>
                      <div className="relative z-[40]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement destination *</label>
                        <CustomSelect value={formData.destLocation} onChange={(val) => updateForm('destLocation', val)} options={locationOptions} placeholder="Destination..." className="w-full"/>
                      </div>
                  </div>
                )}

                {/* --- INSTALL ACTION --- */}
                {action === 'install' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client *</label>
                        <input type="text" required value={formData.client} onChange={e => updateForm('client', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: Mairie de Paris" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site / Bâtiment</label>
                        <input type="text" value={formData.site} onChange={e => updateForm('site', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: Bâtiment A" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emplacement exact</label>
                        <input type="text" value={formData.exactLocation} onChange={e => updateForm('exactLocation', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-xs" placeholder="Ex: Baie réseau U12, Porte Sud..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'installation *</label>
                        <input type="date" required value={formData.installDate} onChange={e => updateForm('installDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div className="relative z-[40]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Installé par *</label>
                        <CustomSelect value={formData.technician} onChange={(val) => updateForm('technician', val)} options={technicianOptions} placeholder="Sélectionner..." className="w-full"/>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BREAKDOWN ACTION --- */}
                {action === 'breakdown' && (
                  <div className="space-y-4">
                    <div className="relative z-[50]">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de constatation *</label>
                      <input type="date" required value={formData.installDate} onChange={e => updateForm('installDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Diagnostic préliminaire *</label>
                      <input type="text" required value={formData.diagnostic} onChange={e => updateForm('diagnostic', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: Problème alimentation, LED rouge clignotante..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative z-[40]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gravité *</label>
                        <CustomSelect value={formData.gravity} onChange={(val) => updateForm('gravity', val)} options={gravityOptions} placeholder="Sélectionner..." className="w-full"/>
                      </div>
                      <div className="relative z-[30]">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Technicien *</label>
                        <CustomSelect value={formData.technician} onChange={(val) => updateForm('technician', val)} options={technicianOptions} placeholder="Sélectionner..." className="w-full"/>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- RETURN ACTION --- */}
                {action === 'return_supplier' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fournisseur / SAV *</label>
                      <input type="text" required value={formData.supplier} onChange={e => updateForm('supplier', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Nom du SAV ou destinataire" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif de retour *</label>
                      <input type="text" required value={formData.reason} onChange={e => updateForm('reason', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: DOA, Réparation sous garantie..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'envoi prévue</label>
                      <input type="date" value={formData.plannedDate} onChange={e => updateForm('plannedDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                )}

                {/* --- REPLACE ACTION --- */}
                {action === 'replace' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                       <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">L'ancien équipement ({selectedSerial?.serial || "non défini"}) sera marqué comme remplacé.</p>
                    </div>
                    <div className="relative z-[50]">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nouveau N° de série *</label>
                      <CustomSelect 
                        value={formData.newSerial} 
                        onChange={(val) => updateForm('newSerial', val)} 
                        options={serialOptions.filter(s => s.value !== selectedSerialId)} 
                        placeholder="Sélectionner le nouvel équipement..." 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Raison du remplacement</label>
                      <input type="text" value={formData.reason} onChange={e => updateForm('reason', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: Échange standard SAV" />
                    </div>
                  </div>
                )}

                {/* COMMENT FIELD FOR ALL ACTIONS (except import) */}
                {action !== 'import' && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Commentaire ou Réf. document</label>
                    <textarea 
                      rows={2} 
                      value={formData.comment} 
                      onChange={e => updateForm('comment', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                      placeholder="Infos supplémentaires, N° de ticket, lien vers PV..."
                    />
                  </div>
                )}

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 z-10 relative">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="serial-action-form"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${action === 'breakdown' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Confirmer
                  </>
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
