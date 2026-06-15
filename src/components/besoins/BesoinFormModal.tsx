import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Check, Package, Wrench, Calendar, 
  Plus, Trash2, AlertCircle, TrendingUp,
  Info, ShieldAlert, ChevronRight, ChevronLeft,
  Briefcase, User, MapPin, Clock, Search, WandSparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { 
  Besoin, BesoinProduct, BesoinService, 
  Priority, BesoinStatus, ImpactProject 
} from './types';
import { useModules } from '../../contexts/ModuleContext';
import { api } from '../../api';

interface BesoinFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (besoin: Besoin) => void;
  initialData?: Besoin | null;
}

const PRIORITY_OPTIONS = [
  { value: 'Basse', label: 'Basse' },
  { value: 'Moyenne', label: 'Moyenne' },
  { value: 'Haute', label: 'Haute' },
  { value: 'Critique', label: 'Critique' },
];

const UNIT_OPTIONS = [
  { value: 'Unités', label: 'Unités' },
  { value: 'Mètres', label: 'Mètres' },
  { value: 'Heures', label: 'Heures' },
  { value: 'Jours', label: 'Jours' },
];

const SKILL_OPTIONS = [
  { value: 'Réseau & Sécurité', label: 'Réseau & Sécurité' },
  { value: 'Câblage structuré', label: 'Câblage structuré' },
  { value: 'Configuration logicielle', label: 'Configuration logicielle' },
  { value: 'Génie civil', label: 'Génie civil' },
];

type Step = 'contexte' | 'produits' | 'services' | 'verification';

export function BesoinFormModal({ isOpen, onClose, onSave, initialData }: BesoinFormModalProps) {
  const { isModuleEnabled } = useModules();
  const [currentStep, setCurrentStep] = useState<Step>('contexte');
  const [formData, setFormData] = useState<Partial<Besoin>>({
    priority: 'Moyenne',
    status: 'Brouillon',
    impactProject: 'Aucun blocage',
    products: [],
    services: [],
    substitutions: [],
    history: [],
    totalCoverageRate: 0,
    isUrgent: false,
    modificationReason: '',
    createdAt: new Date().toISOString()
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogServices, setCatalogServices] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getProjects(), api.getProducts(), api.getServices()])
        .then(([projectData, productData, serviceData]) => {
          setProjects(projectData);
          setCatalogProducts(productData.map((product: any) => ({
            id: product.id,
            label: product.name,
            reference: product.reference,
            physicalStock: Number(product.physicalStock || 0),
            reservedStock: Number(product.reservedStock || 0),
            availableStock: Number(product.availableStock || 0),
            orderedStock: Number(product.orderedStock || 0),
            unit: 'Unités'
          })));
          setCatalogServices(serviceData.map((service: any) => ({
            id: service.id,
            label: service.name,
            unit: service.unit || 'Unité',
            skill: service.family || 'Service technique'
          })));
        })
        .catch(console.error);
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          priority: 'Moyenne',
          status: 'Brouillon',
          impactProject: 'Aucun blocage',
          products: [],
          services: [],
          substitutions: [],
          history: [],
          totalCoverageRate: 0,
          isUrgent: false,
          modificationReason: '',
          createdAt: new Date().toISOString()
        });
      }
      setCurrentStep('contexte');
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof Besoin, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-fill client if project changes
      if (field === 'projectId') {
        const project = projects.find(p => p.id === value);
        if (project) {
          newData.projectName = project.name;
          newData.clientId = project.clientId || '';
          newData.clientName = project.clientName;
          newData.site = project.siteName || '';
          newData.responsible = project.responsibleName || '';
        }
      }
      
      return newData;
    });
    setHasChanges(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addProductRow = () => {
    const newProduct: BesoinProduct = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      reference: '',
      requestedQty: 1,
      availableQty: 0,
      reservedQty: 0,
      missingQty: 0,
      status: 'À réserver',
    };
    setFormData(prev => ({
      ...prev,
      products: [...(prev.products || []), newProduct]
    }));
    setHasChanges(true);
  };

  const removeProductRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: (prev.products || []).filter(p => p.id !== id)
    }));
    setHasChanges(true);
  };

  const updateProductRow = (id: string, updates: Partial<BesoinProduct>) => {
    setFormData(prev => ({
      ...prev,
      products: (prev.products || []).map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          
          const catalogItem = catalogProducts.find(cp => cp.id === updated.productId || cp.label === updated.label);
          if (catalogItem) {
            const availableQty = Number(catalogItem.availableStock || 0);
            const requestedQty = Math.max(1, Math.min(Number(updated.requestedQty || 1), Math.max(availableQty, 1)));
            const reservedQty = Math.min(requestedQty, availableQty);

            updated.productId = catalogItem.id;
            updated.reference = catalogItem.reference;
            updated.availableQty = availableQty;
            updated.requestedQty = requestedQty;
            updated.reservedQty = reservedQty;
            updated.missingQty = Math.max(0, requestedQty - reservedQty);
            updated.status = reservedQty >= requestedQty ? 'Réservé' : 'Partiellement réservé';
          }
          
          return updated;
        }
        return p;
      })
    }));
    setHasChanges(true);
  };

  const addServiceRow = () => {
    const newService: BesoinService = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      plannedDuration: 1,
      unit: 'Heures',
      plannedDate: new Date().toISOString().split('T')[0],
      status: 'En attente',
    };
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), newService]
    }));
    setHasChanges(true);
  };

  const removeServiceRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).filter(s => s.id !== id)
    }));
    setHasChanges(true);
  };

  const updateServiceRow = (id: string, updates: Partial<BesoinService>) => {
    setFormData(prev => ({
      ...prev,
      services: (prev.services || []).map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          if (updates.label) {
            const catalogItem = catalogServices.find(cs => cs.label === updates.label);
            if (catalogItem) {
              updated.serviceId = catalogItem.id;
              updated.unit = catalogItem.unit;
              updated.requiredSkill = catalogItem.skill;
            }
          }
          return updated;
        }
        return s;
      })
    }));
    setHasChanges(true);
  };

  const handleDemoFillStep = () => {
    const plannedDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (currentStep === 'contexte') {
      const project = projects.find((item) => !['Terminé', 'Annulé'].includes(item.status)) || projects[0];
      setFormData(prev => ({
        ...prev,
        projectId: project?.id || prev.projectId,
        projectName: project?.name || prev.projectName || 'Projet démonstration',
        clientId: project?.clientId || prev.clientId || '',
        clientName: project?.clientName || prev.clientName || 'Client démonstration',
        site: project?.siteName || prev.site || 'Site principal',
        responsible: project?.responsibleName || prev.responsible || 'Yassir Berrada',
        plannedDate,
        priority: 'Haute',
        status: 'Brouillon',
        impactProject: 'Aucun blocage',
        justification: 'Besoin nécessaire pour préparer les ressources avant l’intervention terrain.',
        internalComment: 'Démonstration : les quantités produits sont limitées par le stock disponible.'
      }));
    }

    if (currentStep === 'produits') {
      const demoProducts = catalogProducts.filter((item) => Number(item.availableStock || 0) > 0).slice(0, 3);
      setFormData(prev => ({
        ...prev,
        products: demoProducts.map((item, index) => {
          const available = Number(item.availableStock || 0);
          const requestedQty = Math.max(1, Math.min(available, [3, 2, 5][index] || 1));
          return {
            id: `demo-product-${item.id}-${index}`,
            productId: item.id,
            label: item.label,
            reference: item.reference,
            requestedQty,
            availableQty: available,
            reservedQty: requestedQty,
            missingQty: 0,
            location: 'EMPL-A-01',
            status: 'Réservé'
          };
        })
      }));
    }

    if (currentStep === 'services') {
      const demoServices = catalogServices.slice(0, 2);
      setFormData(prev => ({
        ...prev,
        services: demoServices.map((item, index) => ({
          id: `demo-service-${item.id}-${index}`,
          serviceId: item.id,
          label: item.label,
          plannedDuration: index === 0 ? 4 : 1,
          unit: item.unit || 'Heures',
          requiredSkill: item.skill || 'Service technique',
          assignedResource: index === 0 ? 'Équipe technique A' : undefined,
          plannedDate,
          status: index === 0 ? 'Planifié' : 'À affecter'
        }))
      }));
    }

    if (currentStep === 'verification') {
      const hasMissing = (formData.products || []).some((item) => (item.missingQty || 0) > 0);
      setFormData(prev => ({
        ...prev,
        status: hasMissing ? 'Partiellement couvert' : 'À valider',
        impactProject: hasMissing ? 'Risque de retard' : 'Aucun blocage',
        modificationReason: initialData ? 'Ajustement de démonstration avant validation.' : prev.modificationReason,
        internalComment: prev.internalComment || 'Démonstration vérifiée : le stock disponible verrouille les quantités demandées.'
      }));
    }

    setErrors({});
    setHasChanges(true);
  };
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.projectId) newErrors.projectId = 'Requis';
    if (!formData.plannedDate) newErrors.plannedDate = 'Requise';
    if (!formData.responsible) newErrors.responsible = 'Requis';
    
    if (initialData && !formData.modificationReason) {
      newErrors.modificationReason = 'Motif obligatoire pour toute modification';
    }

    // Validate products and services at least one element exists
    if ((formData.products?.length || 0) === 0 && (formData.services?.length || 0) === 0) {
      newErrors.empty = 'Ajoutez au moins un produit ou un service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        const saved = await api.createProjectNeed(formData);
        if ((formData.products?.length || 0) > 0 && formData.projectId) {
          const reservationResponse = await api.createReservation({ projetId: formData.projectId });
          if (!reservationResponse.ok) {
            const reservationError = await reservationResponse.json();
            throw new Error(reservationError.error || 'Impossible de créer la réservation de démonstration');
          }
        }
        const finalData = {
          ...formData,
          id: saved.id,
          reference: saved.reference,
          status: saved.status,
          totalCoverageRate: calculateCoverageRate(),
          isUrgent: formData.priority === 'Critique' || formData.priority === 'Haute',
          history: [
            ...(formData.history || []),
            {
              id: Math.random().toString(36).substr(2, 9),
              date: new Date().toISOString().replace('T', ' ').substr(0, 16).replace('-', '/'),
              type: formData.id ? 'Modification' : 'Création',
              user: 'User Demo',
              description: formData.id ? `Mise à jour du dossier de besoin. Motif: ${formData.modificationReason || 'Non spécifié'}` : 'Initialisation du dossier de besoin.'
            }
          ]
        } as Besoin;
        
        onSave(finalData);
        setIsSubmitting(false);
        onClose();
      } catch (error) {
        console.error(error);
        setErrors({ empty: error instanceof Error ? error.message : 'Impossible de créer le besoin' });
        setIsSubmitting(false);
      }
    } else {
      // If modification reason is missing, stay on verification
      if (initialData && !formData.modificationReason) {
        setCurrentStep('verification');
      } else {
        setCurrentStep('contexte');
      }
    }
  };

  const calculateCoverageRate = () => {
    const totalItems = (formData.products?.length || 0) + (formData.services?.length || 0);
    if (totalItems === 0) return 0;
    
    const coveredProducts = (formData.products || []).filter(p => (p.reservedQty || 0) >= p.requestedQty).length;
    const assignedServices = (formData.services || []).filter(s => !!s.assignedResource).length;
    
    return Math.round(((coveredProducts + assignedServices) / totalItems) * 100);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const STEPS = [
    { key: 'contexte', label: 'Contexte', icon: Info },
    { key: 'produits', label: 'Produits', icon: Package },
    ...(isModuleEnabled('services') ? [{ key: 'services', label: 'Services', icon: Wrench }] : []),
    { key: 'verification', label: 'Vérification', icon: ShieldAlert },
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transition-colors"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 transition-colors">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {initialData ? 'Modifier le besoin' : 'Nouveau dossier de besoin'}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {initialData ? `Référence: ${initialData.reference}` : 'Planifiez vos ressources pour un projet'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDemoFillStep}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <WandSparkles className="w-4 h-4" /> Remplir cette étape
              </button>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 flex items-center justify-center gap-1 md:gap-4 overflow-x-auto no-scrollbar transition-colors">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isPast = STEPS.findIndex(s => s.key === currentStep) > idx;

              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => setCurrentStep(step.key as Step)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
                      isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : 
                      isPast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-colors",
                      isActive ? "border-indigo-500 bg-indigo-500 text-white" : 
                      isPast ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 dark:border-slate-800"
                    )}>
                      {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className="w-4 md:w-8 h-px bg-slate-200 dark:bg-slate-800" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
            {currentStep === 'contexte' && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contexte Projet</h3>
                    </div>
                    
                    <div>
                      <FormField label="Projet Client" required error={errors.projectId}>
                        <CustomSelect 
                          value={formData.projectId || ''}
                          onChange={v => handleChange('projectId', v)}
                          options={projects
                            .filter(p => !['Terminé', 'Annulé'].includes(p.status))
                            .map(p => ({ value: p.id, label: `${p.reference} — ${p.name}` }))}
                          placeholder="Sélectionner un projet..."
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Client (Auto)">
                        <input 
                          type="text" 
                          value={formData.clientName || ''} 
                          readOnly 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                        />
                      </FormField>
                      <FormField label="Site concerné">
                        <input 
                          type="text" 
                          value={formData.site || ''} 
                          onChange={e => handleChange('site', e.target.value)}
                          placeholder="Localisation précise"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200"
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Responsable" required error={errors.responsible}>
                        <input 
                          type="text" 
                          value={formData.responsible || ''} 
                          onChange={e => handleChange('responsible', e.target.value)}
                          placeholder="Nom du responsable"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200"
                        />
                      </FormField>
                      <FormField label="Date d'utilisation" required error={errors.plannedDate}>
                        <input 
                          type="date" 
                          value={formData.plannedDate || ''} 
                          onChange={e => handleChange('plannedDate', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200"
                        />
                      </FormField>
                    </div>

                    <FormField label="Priorité">
                      <CustomSelect 
                        value={formData.priority || 'Moyenne'}
                        onChange={v => handleChange('priority', v as Priority)}
                        options={PRIORITY_OPTIONS}
                      />
                    </FormField>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-amber-500 rounded-full" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Justification & Notes</h3>
                    </div>
                    
                    <FormField label="Justification du besoin">
                      <textarea 
                        value={formData.justification || ''} 
                        onChange={e => handleChange('justification', e.target.value)}
                        rows={4}
                        placeholder="Pourquoi ce besoin est-il nécessaire ?"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 resize-none"
                      />
                    </FormField>

                    <FormField label="Commentaire interne">
                      <textarea 
                        value={formData.internalComment || ''} 
                        onChange={e => handleChange('internalComment', e.target.value)}
                        rows={3}
                        placeholder="Notes pour l'équipe technique/stock..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 resize-none italic"
                      />
                    </FormField>

                    {errors.empty && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">
                        <AlertCircle className="w-4 h-4" />
                        {errors.empty}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {currentStep === 'produits' && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Produits nécessaires</h3>
                  </div>
                  <button 
                    onClick={addProductRow}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un produit
                  </button>
                </div>

                <div className="space-y-4">
                  {(formData.products || []).length > 0 ? (
                    (formData.products || []).map((product: BesoinProduct, idx: number) => (
                      <ProductLine 
                        key={product.id} 
                        product={product} 
                        onUpdate={(updates) => updateProductRow(product.id, updates)}
                        onRemove={() => removeProductRow(product.id)}
                        idx={idx}
                        catalogProducts={catalogProducts}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium italic">Aucun produit ajouté pour le moment.</p>
                      <button 
                        onClick={addProductRow}
                        className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Cliquez ici pour ajouter la première ligne
                      </button>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {currentStep === 'services' && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Services & Prestations</h3>
                  </div>
                  <button 
                    onClick={addServiceRow}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un service
                  </button>
                </div>

                <div className="space-y-4">
                  {(formData.services || []).length > 0 ? (
                    (formData.services || []).map((service: BesoinService, idx: number) => (
                      <ServiceLine 
                        key={service.id} 
                        service={service} 
                        onUpdate={(updates) => updateServiceRow(service.id, updates)}
                        onRemove={() => removeServiceRow(service.id)}
                        idx={idx}
                        catalogServices={catalogServices}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium italic">Aucun service ajouté pour le moment.</p>
                      <button 
                        onClick={addServiceRow}
                        className="mt-4 text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Cliquez ici pour ajouter la première prestation
                      </button>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {currentStep === 'verification' && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Résumé & Vérification de conformité</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                      Veuillez vérifier les éléments ci-dessous avant de valider votre dossier de besoin. Les stocks seront simulés pour vérifier l'impact immédiat.
                    </p>
                  </div>
                </div>

                  <div className={cn("grid gap-6", isModuleEnabled('services') ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                  {/* Stock Impact */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                     <Package className="w-4 h-4 text-indigo-500" />
                     <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Impact Stock</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      {(formData.products || []).map(p => {
                        const isMissing = p.missingQty > 0;
                        return (
                          <div key={p.id} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                             <div className="flex justify-between items-start">
                               <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.label || 'Produit non défini'}</span>
                               <span className={cn("text-[10px] font-black uppercase", isMissing ? "text-red-500" : "text-emerald-500")}>
                                 {isMissing ? 'Manquant' : 'Disponible'}
                               </span>
                             </div>
                             <div className="flex items-center gap-3">
                               <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div 
                                   className={cn("h-full transition-all", isMissing ? "bg-amber-500" : "bg-emerald-500")}
                                   style={{ width: `${Math.min(100, ((p.availableQty || 0) / (p.requestedQty || 1)) * 100)}%` }}
                                 />
                               </div>
                               <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                                 {Math.min(p.requestedQty, p.availableQty || 0)}/{p.requestedQty}
                               </span>
                             </div>
                          </div>
                        );
                      })}
                      {(formData.products || []).length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Aucun produit</p>}
                    </div>
                  </div>

                  {/* Services Impact */}
                  {isModuleEnabled('services') && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                     <Wrench className="w-4 h-4 text-emerald-500" />
                     <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Couverture Services</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      {(formData.services || []).map(s => {
                        const isAssigned = !!s.assignedResource;
                        return (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{s.label || 'Service non défini'}</span>
                               <span className="text-[10px] text-slate-500 font-medium">{s.plannedDuration} {s.unit} - {s.requiredSkill}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               {isAssigned ? (
                                 <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase border border-emerald-200">Affecté</div>
                               ) : (
                                 <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold uppercase border border-slate-200">À affecter</div>
                               )}
                             </div>
                          </div>
                        );
                      })}
                      {(formData.services || []).length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Aucun service</p>}
                    </div>
                  </div>
                  )}
                </div>

                {/* Final impact Assessment */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calcul de l'impact projet</span>
                       <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Diagnostic global</h4>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{calculateCoverageRate()}%</span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Taux de couverture</span>
                    </div>
                  </div>

                  <div className={cn("grid gap-6", isModuleEnabled('services') ? "grid-cols-3" : "grid-cols-2")}>
                    <ImpactMetrique label="À commander" value={(formData.products || []).reduce((acc, p) => acc + (p.missingQty > 0 ? 1 : 0), 0)} color="text-red-400" />
                    {isModuleEnabled('services') && (
                      <ImpactMetrique label="À affecter" value={(formData.services || []).filter(s => !s.assignedResource).length} color="text-amber-400" />
                    )}
                    <ImpactMetrique label="Ressources OK" value={(formData.products || []).filter(p => p.missingQty === 0).length + (isModuleEnabled('services') ? (formData.services || []).filter(s => !!s.assignedResource).length : 0)} color="text-emerald-400" />
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-400/10 border border-red-100 dark:border-red-400/20">
                         <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impact possible</p>
                        <p className={cn("text-xs font-bold", calculateCoverageRate() < 50 ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                          {calculateCoverageRate() < 50 ? "Risque élevé de blocage projet" : "Projet maîtrisé"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Simulation de stock OK</span>
                    </div>
                  </div>
                </div>

                {initialData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Motif de la modification</h4>
                    </div>
                    <FormField label="Pourquoi modifiez-vous ce dossier ?" required error={errors.modificationReason}>
                      <textarea 
                        value={formData.modificationReason || ''} 
                        onChange={e => handleChange('modificationReason', e.target.value)}
                        rows={2}
                        placeholder="Ex: Changement de scope, erreur de saisie, indisponibilité produit..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium resize-none shadow-sm"
                      />
                    </FormField>
                  </motion.div>
                )}
              </motion.section>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex items-center justify-between rounded-b-3xl transition-colors">
            <div className="flex items-center gap-2">
               {currentStep !== 'contexte' && (
                 <button
                   onClick={() => {
                     const idx = STEPS.findIndex(s => s.key === currentStep);
                     setCurrentStep(STEPS[idx - 1].key as Step);
                   }}
                   className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                 >
                   <ChevronLeft className="w-4 h-4" /> Précédent
                 </button>
               )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Annuler
              </button>
              
              {currentStep !== 'verification' ? (
                <button
                  onClick={() => {
                    const idx = STEPS.findIndex(s => s.key === currentStep);
                    setCurrentStep(STEPS[idx + 1].key as Step);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className={cn(
                    "px-6 py-2.5 bg-[#3b82f6] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-sm flex items-center gap-2 uppercase tracking-wider",
                    isSubmitting && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Enregistrer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function FormField({ label, required, children, error }: { label: string, required?: boolean, children: React.ReactNode, error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1 mt-0.5">{error}</p>}
    </div>
  );
}

interface ProductLineProps {
  product: BesoinProduct;
  onUpdate: (updates: Partial<BesoinProduct>) => void;
  onRemove: () => void;
  idx: number;
  catalogProducts: any[];
}

const ProductLine: React.FC<ProductLineProps> = ({ product, onUpdate, onRemove, catalogProducts }) => {
  const catalogItem = catalogProducts.find(p => p.label === product.label);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
           <Package className="w-4 h-4 text-indigo-500" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Produit</label>
            <CustomSelect 
              value={product.label}
              onChange={v => onUpdate({ label: v })}
              options={catalogProducts.map(p => ({ value: p.label, label: `${p.reference} — ${p.label}` }))}
              placeholder="Sélectionner..."
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Référence</label>
            <input 
              type="text" 
              value={product.reference} 
              readOnly
              className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent px-3 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Quantité</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1"
                value={product.requestedQty} 
                max={catalogItem?.availableStock || undefined}
                onChange={e => {
                  const rawQty = parseInt(e.target.value) || 0;
                  const lockedQty = catalogItem ? Math.max(1, Math.min(rawQty, catalogItem.availableStock || 1)) : rawQty;
                  onUpdate({ requestedQty: lockedQty });
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Unit</span>
            </div>
          </div>

          <div className="md:col-span-3">
             {catalogItem ? (
               <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Disponibilité</span>
                     <span className={cn("text-[10px] font-black", catalogItem.availableStock > 0 ? "text-emerald-500" : "text-red-500")}>
                       {catalogItem.availableStock} dispos
                     </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                    <span>Stock: {catalogItem.physicalStock}</span>
                    <span>Rés.: {catalogItem.reservedStock}</span>
                    <span>Cmd: {catalogItem.orderedStock}</span>
                    <span className={cn(product.missingQty > 0 ? "text-red-400" : "text-emerald-400")}>
                      Reliquat: {product.missingQty}
                    </span>
                  </div>
               </div>
             ) : (
               <div className="h-full flex items-center justify-center p-2">
                 <span className="text-[10px] text-slate-400 italic font-medium">Sélectionner un produit</span>
               </div>
             )}
          </div>

          <div className="md:col-span-1 flex items-center justify-end">
            <button 
              onClick={onRemove}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ServiceLineProps {
  service: BesoinService;
  onUpdate: (updates: Partial<BesoinService>) => void;
  onRemove: () => void;
  idx: number;
  catalogServices: any[];
}

const ServiceLine: React.FC<ServiceLineProps> = ({ service, onUpdate, onRemove, catalogServices }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
           <Wrench className="w-4 h-4 text-emerald-500" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Service / Prestation</label>
            <CustomSelect 
              value={service.label}
              onChange={v => onUpdate({ label: v })}
              options={catalogServices.map(s => ({ value: s.label, label: s.label }))}
              placeholder="Chercher une prestation..."
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Unité</label>
            <CustomSelect 
              value={service.unit}
              onChange={v => onUpdate({ unit: v })}
              options={UNIT_OPTIONS}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Quantité / Durée</label>
            <input 
              type="number" 
              min="1"
              value={service.plannedDuration} 
              onChange={e => onUpdate({ plannedDuration: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="md:col-span-3">
             <div className="space-y-3">
               <div>
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Compétence requise</label>
                 <CustomSelect 
                   value={service.requiredSkill || ''}
                   onChange={v => onUpdate({ requiredSkill: v })}
                   options={SKILL_OPTIONS}
                 />
               </div>
               <div className="flex items-center justify-between gap-3">
                 <div className="flex-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Date prévue</label>
                   <input 
                     type="date" 
                     value={service.plannedDate} 
                     onChange={e => onUpdate({ plannedDate: e.target.value })}
                     className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white"
                   />
                 </div>
               </div>
             </div>
          </div>

          <div className="md:col-span-1 flex items-center justify-end">
            <button 
              onClick={onRemove}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ImpactMetrique({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={cn("text-xl font-black tabular-nums", color)}>{value}</span>
    </div>
  );
}



