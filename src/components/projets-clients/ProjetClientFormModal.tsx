import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ProjetClient, ProjetClientStatus, ProjetClientPriority } from './types';
import { X, Check, Save, Copy, WandSparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { api } from '../../api';

interface ProjetClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projet: ProjetClient) => void;
  initialData?: ProjetClient;
  mode: 'add' | 'edit' | 'duplicate';
}

const STATUS_OPTIONS: { value: ProjetClientStatus; label: string }[] = [
  { value: 'Brouillon', label: 'Brouillon' },
  { value: 'Planifié', label: 'Planifié' },
  { value: 'En cours', label: 'En cours' },
  { value: 'En attente', label: 'En attente' },
  { value: 'En retard', label: 'En retard' },
  { value: 'Terminé', label: 'Terminé' },
  { value: 'Annulé', label: 'Annulé' },
];

const PRIORITY_OPTIONS: { value: ProjetClientPriority; label: string }[] = [
  { value: 'Basse', label: 'Basse' },
  { value: 'Moyenne', label: 'Moyenne' },
  { value: 'Haute', label: 'Haute' },
  { value: 'Critique', label: 'Critique' },
];

const SITE_OPTIONS = [
  { value: 'Main Resort - Zone A & B', label: 'Main Resort - Zone A & B' },
  { value: 'Siège Central', label: 'Siège Central' },
  { value: 'Site Alpha', label: 'Site Alpha' },
];

const RESPONSIBLE_OPTIONS = [
  { value: 'Yassir Berrada', label: 'Yassir Berrada' },
  { value: 'Jean Dupont', label: 'Jean Dupont' },
  { value: 'Alice Martin', label: 'Alice Martin' },
  { value: 'Lucie Durant', label: 'Lucie Durant' },
];

export function ProjetClientFormModal({ isOpen, onClose, onSave, initialData, mode }: ProjetClientFormModalProps) {
  const [formData, setFormData] = useState<Partial<ProjetClient>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getClients().then(setClients).catch(console.error);

      if (initialData) {
        if (mode === 'duplicate') {
          setFormData({
            ...initialData,
            id: `PRJ-${Math.floor(Math.random() * 10000)}`,
            reference: `${initialData.reference}-COPY`,
            name: `${initialData.name} (Copie)`,
            status: 'Brouillon',
            progress: 0,
            alertes: [],
          });
        } else {
          setFormData(initialData);
        }
      } else {
        setFormData({
          reference: `PRJ-26-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          status: 'Brouillon',
          priority: 'Moyenne',
          progress: 0,
          startDate: new Date().toISOString().split('T')[0],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
      setErrors({});
      setIsDirty(false);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (field: keyof ProjetClient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDemoFill = () => {
    const demoCode = Date.now().toString().slice(-4);
    const client = clients[0];
    const startDate = new Date();
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + 45);

    setFormData(prev => ({
      ...prev,
      reference: `PRJ-DEMO-${demoCode}`,
      name: `Installation réseau et vidéosurveillance ${demoCode}`,
      clientId: client?.id || prev.clientId,
      clientName: client?.name || prev.clientName || 'Client de démonstration',
      siteName: 'Siège Central',
      contactClient: client?.contactName || 'Responsable technique client',
      description: 'Déploiement d’une infrastructure réseau sécurisée et installation des équipements de vidéosurveillance.',
      objectives: 'Installer, configurer et valider les équipements prévus tout en assurant leur traçabilité.',
      responsibleName: 'Yassir Berrada',
      priority: 'Haute',
      status: 'Planifié',
      progress: 0,
      startDate: startDate.toISOString().split('T')[0],
      deadline: deadline.toISOString().split('T')[0],
      budget: {
        planned: 850000,
        materialCost: 0,
        serviceCost: 0,
        otherCosts: 0,
        consumed: 0,
      },
    }));
    setErrors({});
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.reference?.trim()) newErrors.reference = 'Requise';
    if (!formData.name?.trim()) newErrors.name = 'Requis';
    if (!formData.clientId) newErrors.clientId = 'Requis';
    if (mode === 'duplicate' && formData.reference === initialData?.reference) {
      newErrors.reference = 'La référence doit être modifiée';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate() && !isSaving) {
      setIsSaving(true);
      if (mode === 'add' || mode === 'duplicate') {
         try {
           const response = await api.createProject({
              nom: formData.name,
              clientId: formData.clientId,
              managerId: 'u2',
              status: formData.status,
              progress: formData.progress,
              startDate: formData.startDate,
              endDate: formData.deadline,
              budget: formData.budget?.planned || 0,
              priority: formData.priority,
           });
           const created = await response.json();
           if (!response.ok) throw new Error(created.error || 'Impossible de créer le projet');

           onSave({
             ...formData,
             ...created,
             name: formData.name?.trim() || created.name,
             responsibleName: formData.responsibleName || 'Responsable projet',
           } as ProjetClient);
         } catch(err) {
           setErrors({ save: err instanceof Error ? err.message : 'Impossible d’enregistrer le projet.' });
         } finally {
           setIsSaving(false);
         }
      } else {
         // handle update... for now just invoke onSave
         onSave({
           ...formData,
           id: formData.id || Math.random().toString(36).substr(2, 9),
          } as ProjetClient);
         setIsSaving(false);
      }
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  const title = mode === 'add' ? 'Nouveau projet' : mode === 'edit' ? 'Modifier le projet' : 'Dupliquer le projet';
  const description = mode === 'add' ? 'Planifier une nouvelle affaire client' : mode === 'edit' ? 'Mettre à jour les informations du projet' : 'Créer une copie de ce projet';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                {mode === 'add' && (
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <WandSparkles className="w-4 h-4" />
                    Remplir la démo
                  </button>
                )}
                <button onClick={handleClose} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Sec 1: Informations générales */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Informations générales</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Référence <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.reference || ''}
                      onChange={e => handleChange('reference', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.reference ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    {errors.reference && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.reference}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom du projet <span className="text-red-500">*</span></label>
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
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Client <span className="text-red-500">*</span></label>
                      <CustomSelect value={formData.clientId || ''} onChange={v => { const opt = clients.find(c => c.id === v); handleChange('clientId', v); handleChange('clientName', opt ? opt.name : ''); }} options={[{ value: '', label: 'Sélectionner...' }, ...clients.map(c => ({ value: c.id, label: c.name }))]} error={!!errors.clientId} />
                      {errors.clientId && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.clientId}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Site</label>
                      <CustomSelect value={formData.siteName || ''} onChange={v => handleChange('siteName', v)} options={SITE_OPTIONS} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Client</label>
                      <input type="text" value={formData.contactClient || ''} onChange={e => handleChange('contactClient', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Objectif du projet</label>
                    <textarea value={formData.objectives || ''} onChange={e => handleChange('objectives', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none" />
                  </div>
                </div>
              </section>

              {/* Sec 2: Organisation */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Organisation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Chef de projet <span className="text-red-500">*</span></label>
                    <CustomSelect value={formData.responsibleName || ''} onChange={v => handleChange('responsibleName', v)} options={RESPONSIBLE_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priorité</label>
                    <CustomSelect value={formData.priority || 'Moyenne'} onChange={v => handleChange('priority', v)} options={PRIORITY_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Statut Initial</label>
                    <CustomSelect value={formData.status || 'Brouillon'} onChange={v => handleChange('status', v)} options={STATUS_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date de début</label>
                    <input type="date" value={formData.startDate || ''} onChange={e => handleChange('startDate', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Échéance prévue</label>
                    <input type="date" value={formData.deadline || ''} onChange={e => handleChange('deadline', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white" />
                  </div>
                </div>
              </section>

              {/* Sec 3: Données financières */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Données financières</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Budget prévisionnel (HT)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.budget?.planned || 0} 
                        onChange={e => handleChange('budget', { ...formData.budget, planned: parseFloat(e.target.value) })} 
                        className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white font-mono" 
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-bold">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mode de facturation</label>
                    <CustomSelect value="Forfait" onChange={() => {}} options={[{ value: 'Forfait', label: 'Forfait' }, { value: 'Régie', label: 'Régie' }]} />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
              {errors.save && <span className="mr-auto text-sm font-medium text-red-600">{errors.save}</span>}
              <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
                Annuler
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                {mode === 'duplicate' ? <Copy className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Enregistrement...' : mode === 'add' ? 'Créer le projet' : mode === 'edit' ? 'Enregistrer' : 'Confirmer la duplication'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
