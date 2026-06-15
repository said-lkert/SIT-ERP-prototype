import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Client, ClientType, SectorType, ClientStatus } from './types';
import { X, Check, AlertCircle, Building2, User, Phone, Mail, Globe, MapPin, Briefcase, FileText, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { api } from '../../api';

interface ClientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
  mode: 'add' | 'edit' | 'duplicate';
}

export function ClientEditModal({ isOpen, onClose, onSave, client, mode }: ClientEditModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    type: 'Entreprise',
    sector: 'Services',
    address: '',
    city: '',
    region: 'Centre',
    mainContact: '',
    phone: '',
    email: '',
    status: 'Actif',
    sitesCount: 0,
    activeProjects: 0,
    installedEquipments: 0,
    hasExpiredWarranties: false,
    createdAt: new Date().toISOString().split('T')[0],
    reference: `CLT-24-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (client && (mode === 'edit' || mode === 'duplicate')) {
        setFormData({
          ...client,
          name: mode === 'duplicate' ? `${client.name} (Copie)` : client.name,
          reference: mode === 'duplicate' ? `CLT-24-${Math.floor(1000 + Math.random() * 9000)}` : client.reference
        });
      } else {
        setFormData({
          name: '',
          type: 'Entreprise',
          sector: 'Services',
          address: '',
          city: '',
          region: 'Centre',
          mainContact: '',
          phone: '',
          email: '',
          status: 'Actif',
          sitesCount: 0,
          activeProjects: 0,
          installedEquipments: 0,
          hasExpiredWarranties: false,
          createdAt: new Date().toISOString().split('T')[0],
          reference: `CLT-24-${Math.floor(1000 + Math.random() * 9000)}`
        });
      }
      setErrors({});
    }
  }, [isOpen, client, mode]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.mainContact?.trim()) newErrors.mainContact = 'Le contact est requis';
    if (!formData.email?.trim()) newErrors.email = 'L\'email est requis';
    
    if (mode === 'duplicate' && client && formData.name === client.name) {
      newErrors.duplicate = 'Le nom doit être différent du client original';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      if (mode === 'add' || mode === 'duplicate') {
        const payload = {
           nom: formData.name,
           email: formData.email,
           telephone: formData.phone,
           type: formData.type
        };
        await api.createClient(payload);
      }
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        onSave(formData as Client);
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch(err) {
      console.error(err);
      setIsSubmitting(false);
    }
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
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden z-10"
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
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-50 dark:border-emerald-800"
                >
                  <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  {mode === 'add' ? 'Client ajouté !' : mode === 'duplicate' ? 'Client dupliqué !' : 'Client mis à jour !'}
                </h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Enregistrement réussi dans le référentiel</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {mode === 'add' ? 'Nouveau client' : mode === 'duplicate' ? 'Dupliquer client' : 'Modifier client'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                {mode === 'duplicate' ? 'Création par duplication de profil' : 'Référentiel clients & partenaires'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-2xl mx-auto space-y-10">
              
              {/* Informations Générales */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">1. Informations générales</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Raison sociale *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: SARL TechnoBuild"
                        className={cn(
                          "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-bold focus:ring-4 transition-all outline-none uppercase tracking-tight",
                          errors.name ? "border-red-500 focus:ring-red-500/10 text-red-900" : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white"
                        )}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-wider">{errors.name}</p>}
                    {errors.duplicate && <p className="text-[10px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-wider">{errors.duplicate}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Type client</label>
                    <CustomSelect 
                      value={formData.type || 'Entreprise'}
                      onChange={(val) => setFormData({...formData, type: val as ClientType})}
                      options={[
                        { value: 'Entreprise', label: 'Entreprise' },
                        { value: 'Administration', label: 'Administration' },
                        { value: 'Hôtel', label: 'Hôtel' },
                        { value: 'École', label: 'École' },
                        { value: 'Particulier', label: 'Particulier' }
                      ]}
                      className="h-11 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Secteur</label>
                    <CustomSelect 
                      value={formData.sector || 'Services'}
                      onChange={(val) => setFormData({...formData, sector: val as SectorType})}
                      options={[
                        { value: 'IT', label: 'IT & Technologie' },
                        { value: 'Industrie', label: 'Industrie' },
                        { value: 'Hôtellerie', label: 'Hôtellerie' },
                        { value: 'Éducation', label: 'Éducation' },
                        { value: 'Santé', label: 'Santé' },
                        { value: 'Services', label: 'Services' },
                        { value: 'Autre', label: 'Autre' }
                      ]}
                      className="h-11 font-bold text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Adresse principale</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="N°, Rue, Quartier..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Ville</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: Alger"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Statut</label>
                    <CustomSelect 
                      value={formData.status || 'Actif'}
                      onChange={(val) => setFormData({...formData, status: val as ClientStatus})}
                      options={[
                        { value: 'Actif', label: 'ACTIF' },
                        { value: 'Inactif', label: 'INACTIF' },
                        { value: 'Archivé', label: 'ARCHIVÉ' }
                      ]}
                      className="h-11 font-black text-xs tracking-widest"
                    />
                  </div>
                </div>
              </section>

              {/* Contact Principal */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">2. Contact principal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Nom complet *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.mainContact}
                        onChange={(e) => setFormData({...formData, mainContact: e.target.value})}
                        placeholder="Ex: Mohamed Benali"
                        className={cn(
                          "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-bold focus:ring-4 transition-all outline-none",
                          errors.mainContact ? "border-red-500 focus:ring-red-500/10 text-red-900" : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="0XX XX XX XX"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="contact@example.dz"
                        className={cn(
                          "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-bold focus:ring-4 transition-all outline-none",
                          errors.email ? "border-red-500 focus:ring-red-500/10 text-red-900" : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Informations Administratives */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">3. Administration & Ref</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Référence ERP</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.reference}
                        disabled
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-slate-500 outline-none cursor-not-allowed font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Responsable interne</label>
                    <CustomSelect 
                      value="K. Samia"
                      onChange={() => {}}
                      options={[
                        { value: 'K. Samia', label: 'Samia K.' },
                        { value: 'M. Ali', label: 'Ali M.' },
                        { value: 'S. Amine', label: 'Amine S.' }
                      ]}
                      className="h-11 font-bold text-sm"
                    />
                  </div>
                </div>
              </section>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                * Champs obligatoires
             </div>
             <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    "relative px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-[0.2em] group overflow-hidden",
                    isSubmitting && "pr-12 pointer-events-none"
                  )}
                >
                  <span className={cn("inline-flex items-center gap-2", isSubmitting && "opacity-0")}>
                    {mode === 'add' ? 'Créer client' : mode === 'duplicate' ? 'Dupliquer' : 'Enregistrer'}
                  </span>
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
