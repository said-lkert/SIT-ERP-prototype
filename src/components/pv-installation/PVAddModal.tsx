import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InstallationPV, PVStatus, PVResult, PVProduct, ServicePerformed, TestPerformed, Reserve } from './types';
import { X, Check, Search, Plus, Trash2, AlertCircle, Save, Send, Camera, PenTool, CheckCircle2, WandSparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface PVAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (res: InstallationPV, isDraft?: boolean) => void;
  initialData?: InstallationPV;
}

const SOURCES = ['Projet client', 'Livraison client', 'Mission d\'installation', 'Sélection manuelle'];
const PROJECTS = ['Déploiement Fibre Zone Nord', 'Maintenance Serveurs DB', 'Installation Caméras', 'Mise à niveau Routeurs', 'Événement Tech Summit'];

export function PVAddModal({ isOpen, onClose, onSave, initialData }: PVAddModalProps) {
  const [formData, setFormData] = useState<Partial<InstallationPV>>({
    reference: '',
    clientName: '',
    projectName: '',
    siteName: '',
    technician: 'Utilisateur Connecté',
    installationDate: '',
    status: 'Brouillon',
    result: 'Installation conforme',
  });

  const [address, setAddress] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [clientSignatory, setClientSignatory] = useState('');
  const [clientRole, setClientRole] = useState('');
  
  const [source, setSource] = useState('Sélection manuelle');

  const [products, setProducts] = useState<Partial<PVProduct & { stateBefore: string, stateAfter: string, location: string, status: string, remark: string }>[]>([]);
  const [services, setServices] = useState<Partial<ServicePerformed>[]>([]);
  const [tests, setTests] = useState<Partial<TestPerformed>[]>([]);
  
  const [hasNoReserves, setHasNoReserves] = useState(false);
  const [reserves, setReserves] = useState<Partial<Reserve>[]>([]);

  const [isSignedByTech, setIsSignedByTech] = useState(false);
  const [isSignedByClient, setIsSignedByClient] = useState(false);
  const [clientComment, setClientComment] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
       if (initialData) {
          setFormData({
            reference: initialData.reference,
            clientName: initialData.clientName,
            projectName: initialData.projectName,
            siteName: initialData.siteName,
            technician: initialData.technician,
            installationDate: initialData.installationDate,
            status: initialData.status,
            result: initialData.result,
          });
          setAddress(initialData.address || '');
          setTeamMembers(initialData.teamMembers || '');
          setClientSignatory(initialData.clientSignatory || '');
          setClientRole(initialData.clientRole || '');
          setProducts([...initialData.products]);
          setServices(initialData.services ? [...initialData.services] : []);
          setTests(initialData.tests ? [...initialData.tests] : []);
          setReserves(initialData.reserves ? [...initialData.reserves] : []);
          setHasNoReserves(initialData.hasReserves === false);
          setIsSignedByTech(initialData.status === 'Signé' || initialData.status === 'Signé avec réserves');
          setIsSignedByClient(initialData.status === 'Signé' || initialData.status === 'Signé avec réserves');
          setClientComment(initialData.clientComment || '');
       } else {
          setFormData({
            reference: `PV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            clientName: '',
            projectName: '',
            siteName: '',
            technician: 'Jean Admin',
            installationDate: new Date().toISOString().split('T')[0],
            status: 'Brouillon',
            result: 'Installation conforme',
          });
          setAddress('');
          setTeamMembers('');
          setClientSignatory('');
          setClientRole('');
          setSource('Sélection manuelle');
          setProducts([]);
          setServices([]);
          setTests([]);
          setReserves([]);
          setHasNoReserves(false);
          setIsSignedByTech(false);
          setIsSignedByClient(false);
          setClientComment('');
       }
       setErrors({});
       setHasChanges(false);
       setShowConfirmClose(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (hasChanges) {
       setShowConfirmClose(true);
    } else {
       onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };

  const markChanged = () => setHasChanges(true);

  const handleSourceChange = (s: string) => {
    markChanged();
    setSource(s);
    if (s !== 'Sélection manuelle') {
      // Simulate prefill
      setFormData(prev => ({
        ...prev,
        projectName: PROJECTS[0],
        clientName: 'TechCorp Industries',
        siteName: 'Site Principal - Bâtiment A',
      }));
      setAddress('12 Rue de l\'Innovation, 75001 Paris');
      setProducts([{
        productId: 'prod1',
        productName: 'Caméra IP 4K Extérieure',
        productReference: 'CAM-4K',
        serialNumber: 'SN-CAM-1023',
        installedQty: 1,
        stateBefore: 'Neuf emballé',
        stateAfter: 'Installé et fonctionnel',
        location: 'Porte Principale',
        status: 'Terminé',
        remark: ''
      }]);
    }
  };

  const fillDemo = () => {
    setFormData(prev => ({
      ...prev,
      clientName: 'Hôtel Les Oliviers',
      projectName: 'Installation réseau - Hôtel Les Oliviers',
      siteName: 'Bâtiment principal',
      technician: 'Technicien démonstration',
      installationDate: new Date().toISOString().split('T')[0],
      status: 'Signé',
      result: 'Installation conforme',
    }));
    setAddress('Tizi-Ouzou, site principal');
    setTeamMembers('Technicien démonstration, Karim Benali');
    setClientSignatory('Responsable du site');
    setClientRole('Directeur technique');
    setSource('Projet client');
    setProducts([{
      productId: 'demo-product',
      productName: 'Caméra IP Hikvision',
      productReference: 'CAM-HIK-EXT',
      serialNumber: `HIK-PV-${Date.now().toString().slice(-4)}`,
      installedQty: 1,
      stateBefore: 'Neuf',
      stateAfter: 'Installé et fonctionnel',
      location: 'Entrée principale',
      status: 'Terminé',
      remark: '',
    }]);
    setServices([{ name: 'Installation et configuration', description: 'Pose, raccordement et paramétrage', technician: 'Technicien démonstration', duration: '2h', result: 'Conforme', comment: '' }]);
    setTests([{ name: 'Test de fonctionnement', equipment: 'Caméra IP Hikvision', expectedResult: 'Image disponible', actualResult: 'Image claire et stable', status: 'Réussi', observation: '' }]);
    setHasNoReserves(true);
    setReserves([]);
    setIsSignedByTech(true);
    setIsSignedByClient(true);
    setClientComment('Installation réceptionnée sans réserve.');
    setHasChanges(true);
    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.projectName) newErrors.projectName = 'Ce champ est requis';
    if (!formData.clientName) newErrors.clientName = 'Ce champ est requis';
    
    products.forEach((p, index) => {
      if (!p.productName) newErrors[`product_${index}_name`] = 'Requis';
      if (!p.serialNumber) newErrors[`product_${index}_sn`] = 'Requis (unique)';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (newStatus: PVStatus) => {
    if (validate()) {
      const formattedProducts: PVProduct[] = products.map((p, i) => ({
        id: `pv_p_${i}`,
        productId: p.productId || `prod_${i}`,
        productName: p.productName || 'Inconnu',
        productReference: p.productReference || 'REF-INC',
        serialNumber: p.serialNumber || 'SN-NC',
        installedQty: p.installedQty || 1,
      }));

      const isSignaturePending = (newStatus === 'En attente de signature');
      const isSigned = (newStatus === 'Signé' || newStatus === 'Signé avec réserves');

      const pv: InstallationPV = {
        ...formData,
        id: initialData?.id || `temp_${Date.now()}`,
        reference: formData.reference || `PV-x`,
        clientName: formData.clientName || '',
        projectName: formData.projectName || '',
        siteName: formData.siteName || '',
        address,
        teamMembers,
        clientRole,
        technician: formData.technician || '',
        clientSignatory: clientSignatory,
        installationDate: formData.installationDate || new Date().toISOString().split('T')[0],
        signatureDate: isSigned ? new Date().toISOString().split('T')[0] : undefined,
        clientComment,
        status: newStatus,
        result: formData.result as PVResult,
        hasReserves: !hasNoReserves && reserves.length > 0,
        reservesDetails: reserves.length > 0 ? `${reserves.length} réserve(s) signalée(s)` : undefined,
        products: formattedProducts,
        services: services as ServicePerformed[],
        tests: tests as TestPerformed[],
        reserves: reserves as Reserve[],
        createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
      };

      onSave(pv, newStatus === 'Brouillon');
      onClose();
    }
  };

  // --- Array updaters ---
  const addProductLine = () => {
    markChanged();
    setProducts([...products, { productId: '', productName: '', productReference: '', serialNumber: '', installedQty: 1, location: '', stateBefore: '', stateAfter: '', status: '', remark: '' }]);
  };
  const removeProductLine = (index: number) => {
    markChanged();
    setProducts(products.filter((_, i) => i !== index));
  };
  const updateProductLine = (index: number, field: string, value: any) => {
    markChanged();
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const addServiceLine = () => {
    markChanged();
    setServices([...services, { name: '', description: '', technician: formData.technician, duration: '', result: '', comment: '' }]);
  };
  const removeServiceLine = (index: number) => {
    markChanged();
    setServices(services.filter((_, i) => i !== index));
  };
  const updateServiceLine = (index: number, field: string, value: any) => {
    markChanged();
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addTestLine = () => {
    markChanged();
    setTests([...tests, { name: '', equipment: '', expectedResult: '', actualResult: '', status: '', observation: '' }]);
  };
  const removeTestLine = (index: number) => {
    markChanged();
    setTests(tests.filter((_, i) => i !== index));
  };
  const updateTestLine = (index: number, field: string, value: any) => {
    markChanged();
    const updated = [...tests];
    updated[index] = { ...updated[index], [field]: value };
    setTests(updated);
  };

  const addReserveLine = () => {
    markChanged();
    setReserves([...reserves, { type: '', description: '', equipment: '', priority: 'Moyenne', responsible: '', resolutionDate: '' }]);
    setHasNoReserves(false);
  };
  const removeReserveLine = (index: number) => {
    markChanged();
    setReserves(reserves.filter((_, i) => i !== index));
  };
  const updateReserveLine = (index: number, field: string, value: any) => {
    markChanged();
    const updated = [...reserves];
    updated[index] = { ...updated[index], [field]: value };
    setReserves(updated);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[100vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nouveau PV d'installation</h2>
            <p className="text-sm text-slate-500">Validez les équipements installés et les services réalisés chez le client.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={fillDemo} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
              <WandSparkles className="w-4 h-4" /> Remplissage démo
            </button>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Pré-remplissage</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {SOURCES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSourceChange(s)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
                    source === s 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="text-sm font-medium text-center">{s}</span>
                </button>
              ))}
            </div>
            {source !== 'Sélection manuelle' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Séquence préremplie détectée. Les données ont été importées.
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">1. Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° PV (Auto)</label>
                <input type="text" value={formData.reference} disabled className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-slate-500 font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Projet / Affaire *</label>
                <select
                  value={formData.projectName}
                  onChange={(e) => { markChanged(); setFormData({ ...formData, projectName: e.target.value }); }}
                  className={cn("w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", errors.projectName ? "border-red-300 focus:ring-red-500" : "border-slate-300 dark:border-slate-700")}
                >
                  <option value="">Sélectionner</option>
                  {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.projectName && <p className="mt-1 text-xs text-red-500">{errors.projectName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client *</label>
                <input type="text" value={formData.clientName} onChange={(e) => { markChanged(); setFormData({ ...formData, clientName: e.target.value }); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site d'installation</label>
                <input type="text" value={formData.siteName} onChange={(e) => { markChanged(); setFormData({ ...formData, siteName: e.target.value }); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                <input type="text" value={address} onChange={(e) => { markChanged(); setAddress(e.target.value); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'installation</label>
                <input type="date" value={formData.installationDate} onChange={(e) => { markChanged(); setFormData({ ...formData, installationDate: e.target.value }); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Technicien responsable</label>
                <input type="text" value={formData.technician} onChange={(e) => { markChanged(); setFormData({ ...formData, technician: e.target.value }); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membres de l'équipe</label>
                <input type="text" value={teamMembers} onChange={(e) => { markChanged(); setTeamMembers(e.target.value); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Représentant client</label>
                <input type="text" value={clientSignatory} onChange={(e) => { markChanged(); setClientSignatory(e.target.value); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fonction du représentant</label>
                <input type="text" value={clientRole} onChange={(e) => { markChanged(); setClientRole(e.target.value); }} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Équipements installés</h3>
              <button
                type="button"
                onClick={addProductLine}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter un équipement
              </button>
            </div>

            <div className="space-y-4">
              {products.map((p, index) => (
                <div key={index} className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                  <button type="button" onClick={() => removeProductLine(index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Produit *</label>
                      <input type="text" value={p.productName} onChange={(e) => updateProductLine(index, 'productName', e.target.value)} placeholder="Nom du produit" className={cn("w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", errors[`product_${index}_name`] ? "border-red-300" : "border-slate-300 dark:border-slate-700")} />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Référence</label>
                       <input type="text" value={p.productReference} onChange={(e) => updateProductLine(index, 'productReference', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qté *</label>
                      <input type="number" min="1" value={p.installedQty} onChange={(e) => updateProductLine(index, 'installedQty', parseInt(e.target.value) || 1)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Numéro de série *</label>
                      <input type="text" value={p.serialNumber} onChange={(e) => updateProductLine(index, 'serialNumber', e.target.value)} placeholder="SN-..." className={cn("w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500", errors[`product_${index}_sn`] ? "border-red-300" : "border-slate-300 dark:border-slate-700")} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Emplacement exact</label>
                      <input type="text" value={p.location} onChange={(e) => updateProductLine(index, 'location', e.target.value)} placeholder="Ex: Baie brassage 1" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    {/* Ligne 2 : Détails techniques */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">État avant</label>
                      <CustomSelect value={p.stateBefore || ''} onChange={(v) => updateProductLine(index, 'stateBefore', v)} options={[{value:'Neuf',label:'Neuf'}, {value:'Occasion',label:'Occasion'}, {value:'Abîmé',label:'Abîmé'}]} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">État après</label>
                      <CustomSelect value={p.stateAfter || ''} onChange={(v) => updateProductLine(index, 'stateAfter', v)} options={[{value:'Opérationnel',label:'Opérationnel'}, {value:'En panne',label:'En panne'}, {value:'Sous réserve',label:'Sous réserve'}]} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Statut inst.</label>
                      <CustomSelect value={p.status || ''} onChange={(v) => updateProductLine(index, 'status', v)} options={[{value:'Terminé',label:'Terminé'}, {value:'En cours',label:'En cours'}, {value:'Annulé',label:'Annulé'}]} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Remarque</label>
                      <input type="text" value={p.remark} onChange={(e) => updateProductLine(index, 'remark', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun équipement installé.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Travaux et services réalisés</h3>
              <button
                type="button"
                onClick={addServiceLine}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter un service
              </button>
            </div>
            <div className="space-y-4">
              {services.map((s, index) => (
                 <div key={index} className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <button type="button" onClick={() => removeServiceLine(index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                       <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Service / Opération</label>
                          <input type="text" value={s.name} onChange={(e) => updateServiceLine(index, 'name', e.target.value)} placeholder="Ex: Câblage..." className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Description des travaux</label>
                          <input type="text" value={s.description} onChange={(e) => updateServiceLine(index, 'description', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Tech. responsable</label>
                          <input type="text" value={s.technician} onChange={(e) => updateServiceLine(index, 'technician', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Durée</label>
                          <input type="text" value={s.duration} onChange={(e) => updateServiceLine(index, 'duration', e.target.value)} placeholder="Ex: 2h30" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Résultat</label>
                          <CustomSelect value={s.result || ''} onChange={(v) => updateServiceLine(index, 'result', v)} options={[{value:'Validé',label:'Validé'}, {value:'À vérifier',label:'À vérifier'}]} />
                       </div>
                       <div className="md:col-span-12">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Commentaire</label>
                          <input type="text" value={s.comment} onChange={(e) => updateServiceLine(index, 'comment', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                    </div>
                 </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Tests et contrôles</h3>
              <button
                type="button"
                onClick={addTestLine}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter un test
              </button>
            </div>
            <div className="space-y-4">
              {tests.map((t, index) => (
                 <div key={index} className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <button type="button" onClick={() => removeTestLine(index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                       <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Nom du test</label>
                          <input type="text" value={t.name} onChange={(e) => updateTestLine(index, 'name', e.target.value)} placeholder="Ex: Ping Test" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Équipement</label>
                          <input type="text" value={t.equipment} onChange={(e) => updateTestLine(index, 'equipment', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Attendu</label>
                          <input type="text" value={t.expectedResult} onChange={(e) => updateTestLine(index, 'expectedResult', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Obtenu</label>
                          <input type="text" value={t.actualResult} onChange={(e) => updateTestLine(index, 'actualResult', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Statut</label>
                          <CustomSelect value={t.status || ''} onChange={(val) => updateTestLine(index, 'status', val)} options={[{value:'Réussi', label:'Réussi'}, {value:'Échoué', label:'Échoué'}]} />
                       </div>
                       <div className="md:col-span-12">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Observation</label>
                          <input type="text" value={t.observation} onChange={(e) => updateTestLine(index, 'observation', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                    </div>
                 </div>
              ))}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Synthèse générale des tests</label>
              <CustomSelect
                  value={formData.result || ''}
                  onChange={(val) => { markChanged(); setFormData({ ...formData, result: val as PVResult }); }}
                  options={[
                    { value: 'Installation conforme', label: 'Installation conforme' },
                    { value: 'Conforme avec réserves', label: 'Conforme avec réserves' },
                    { value: 'Non conforme', label: 'Non conforme' },
                    { value: 'Tests à reprendre', label: 'Tests à reprendre' }
                  ]}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">5. Réserves et anomalies</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoReserves}
                    onChange={(e) => {
                       markChanged();
                       setHasNoReserves(e.target.checked);
                       if (e.target.checked) setReserves([]);
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Aucune réserve signalée
                </label>
                {!hasNoReserves && (
                   <button
                     type="button"
                     onClick={addReserveLine}
                     className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition-colors"
                   >
                     <Plus className="w-4 h-4" /> Ajouter une réserve
                   </button>
                )}
              </div>
            </div>

            {!hasNoReserves && (
               <div className="space-y-4">
                 {reserves.map((r, index) => (
                    <div key={index} className="flex flex-col gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 relative group">
                       <button type="button" onClick={() => removeReserveLine(index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type de réserve</label>
                             <CustomSelect value={r.type || ''} onChange={(val) => updateReserveLine(index, 'type', val)} options={[{value:'Matérielle', label:'Matérielle'}, {value:'Logicielle', label:'Logicielle'}, {value:'Esthétique', label:'Esthétique'}]} />
                          </div>
                          <div className="md:col-span-5">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description détaillée</label>
                             <input type="text" value={r.description} onChange={(e) => updateReserveLine(index, 'description', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                          </div>
                          <div className="md:col-span-2">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Priorité</label>
                             <CustomSelect value={r.priority || ''} onChange={(val) => updateReserveLine(index, 'priority', val)} options={[{value:'Basse', label:'Basse'}, {value:'Moyenne', label:'Moyenne'}, {value:'Haute', label:'Haute'}]} />
                          </div>
                          <div className="md:col-span-2">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Pièce jointe</label>
                             <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                <Camera className="w-4 h-4" /> Joindre
                             </button>
                          </div>
                          <div className="md:col-span-4">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Équipement</label>
                             <input type="text" value={r.equipment} onChange={(e) => updateReserveLine(index, 'equipment', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                          </div>
                          <div className="md:col-span-4">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Responsable correction</label>
                             <input type="text" value={r.responsible} onChange={(e) => updateReserveLine(index, 'responsible', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                          </div>
                          <div className="md:col-span-4">
                             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date limite de résolution</label>
                             <input type="date" value={r.resolutionDate} onChange={(e) => updateReserveLine(index, 'resolutionDate', e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                          </div>
                       </div>
                    </div>
                 ))}
                 {reserves.length === 0 && !hasNoReserves && (
                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Ajoutez les réserves constatées lors de l'installation.</p>
                    </div>
                 )}
               </div>
            )}
            
            {hasNoReserves && (
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Aucune réserve n'a été signalée pour cette installation.
               </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">6. Validation et signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Installateur */}
               <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">L'installateur</h4>
                  <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nom du technicien</label>
                       <input type="text" value={formData.technician} disabled className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Signature</label>
                       {!isSignedByTech ? (
                         <button onClick={() => { markChanged(); setIsSignedByTech(true); }} className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-indigo-300 dark:border-indigo-700/50 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                            <PenTool className="w-5 h-5" />
                            Signer le document
                         </button>
                       ) : (
                         <div className="relative w-full py-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="font-serif text-3xl text-indigo-900/60 dark:text-indigo-100/60 italic signature-font">Signé</span>
                            <button onClick={() => { markChanged(); setIsSignedByTech(false); }} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                         </div>
                       )}
                     </div>
                  </div>
               </div>

               {/* Client */}
               <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Le client</h4>
                  <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nom et fonction</label>
                       <div className="flex gap-2">
                         <input type="text" placeholder="Nom..." value={clientSignatory} onChange={(e) => { markChanged(); setClientSignatory(e.target.value); }} className="w-1/2 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                         <input type="text" placeholder="Fonction..." value={clientRole} onChange={(e) => { markChanged(); setClientRole(e.target.value); }} className="w-1/2 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Commentaire client final</label>
                       <textarea value={clientComment} onChange={(e) => { markChanged(); setClientComment(e.target.value); }} rows={2} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg resize-none" placeholder="Lu et approuvé..." />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Signature</label>
                       {!isSignedByClient ? (
                         <button onClick={() => { markChanged(); setIsSignedByClient(true); }} className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                            <PenTool className="w-5 h-5" />
                            Signer le document
                         </button>
                       ) : (
                         <div className="relative w-full py-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="font-serif text-3xl text-emerald-900/60 dark:text-emerald-100/60 italic signature-font">Signé par le client</span>
                            <button onClick={() => { markChanged(); setIsSignedByClient(false); }} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                         </div>
                       )}
                     </div>
                  </div>
               </div>

            </div>
          </section>

        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <div className="flex items-center gap-3">
             <button
                onClick={() => handleSave('Brouillon')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
             >
                <Save className="w-4 h-4" /> Brouillon
             </button>
             <button
                onClick={() => handleSave('À compléter')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-transparent rounded-lg shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
             >
                <Check className="w-4 h-4" /> Enregistrer et fermer
             </button>
             <button
                onClick={() => handleSave(isSignedByClient ? 'Signé' : 'En attente de signature')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
                <Send className="w-4 h-4" /> {isSignedByClient ? 'Valider le PV signé' : 'Envoyer pour signature'}
             </button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmClose && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={cancelClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Modifications non enregistrées</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Voulez-vous vraiment quitter ? Toutes vos modifications seront perdues.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={cancelClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
                  Annuler
                </button>
                <button onClick={confirmClose} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  Quitter sans sauvegarder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
}
