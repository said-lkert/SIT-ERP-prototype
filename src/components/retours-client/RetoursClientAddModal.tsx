import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClientReturn, ReturnStatus, ReturnReason } from './types';
import { X, Search, Plus, Trash2, Camera, User, FileText, Calendar, Box, Package, AlertCircle, Save, CheckCircle2, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface RetoursClientAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (res: ClientReturn) => void;
}

const ORIGINS = ['Équipement installé', 'Livraison client', 'Intervention SAV', 'Projet client', 'Sélection manuelle'];

export function RetoursClientAddModal({ isOpen, onClose, onSave }: RetoursClientAddModalProps) {
  const [formData, setFormData] = useState<Partial<ClientReturn>>({
    returnNumber: '',
    clientName: '',
    projectName: '',
    siteName: '',
    equipmentName: '',
    productName: '',
    productReference: '',
    serialNumber: '',
    deliveryNumber: '',
    technician: 'Jean Admin',
    reason: 'Panne' as ReturnReason,
    returnType: 'Retour pour réparation',
    warrantyStatus: 'À vérifier',
    requestDate: new Date().toISOString().split('T')[0],
    warehouseZone: 'Quarantaine',
    status: 'Brouillon'
  });

  const [origin, setOrigin] = useState('Équipement installé');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [priority, setPriority] = useState('Moyenne');
  
  const [reportedState, setReportedState] = useState('');
  const [returnedAccessories, setReturnedAccessories] = useState('');
  const [packagingPresent, setPackagingPresent] = useState(false);
  const [productComment, setProductComment] = useState('');

  const [reasonDescription, setReasonDescription] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issueConditions, setIssueConditions] = useState('');
  const [temporarySolution, setTemporarySolution] = useState('');

  const [issueUrgency, setIssueUrgency] = useState('Normale');

  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [warrantyConditions, setWarrantyConditions] = useState('');

  const [recoveryMethod, setRecoveryMethod] = useState('');
  const [transporter, setTransporter] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [destination, setDestination] = useState('Sur site SAV');
  const [transportInstructions, setTransportInstructions] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
       setFormData({
         returnNumber: `RET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
         clientName: '',
         projectName: '',
         siteName: '',
         equipmentName: '',
         productName: '',
         productReference: '',
         serialNumber: '',
         deliveryNumber: '',
         technician: 'Jean Admin',
         reason: 'Panne' as ReturnReason,
         returnType: 'Retour pour réparation',
         warrantyStatus: 'À vérifier',
         requestDate: new Date().toISOString().split('T')[0],
         warehouseZone: 'Quarantaine',
         status: 'Brouillon'
       });
       setOrigin('Équipement installé');
       setContactName('');
       setContactPhone('');
       setPriority('Moyenne');
       setReportedState('');
       setReturnedAccessories('');
       setPackagingPresent(false);
       setProductComment('');
       setReasonDescription('');
       setIssueDate('');
       setIssueConditions('');
       setTemporarySolution('');
       setWarrantyStartDate('');
       setWarrantyEndDate('');
       setManufacturer('');
       setWarrantyConditions('');
       setRecoveryMethod('');
       setTransporter('');
       setExpectedReturnDate('');
       setDestination('Sur site SAV');
       setTransportInstructions('');
       setErrors({});
       setHasChanges(false);
       setShowConfirmClose(false);
    }
  }, [isOpen]);

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

  const handleOriginChange = (o: string) => {
    markChanged();
    setOrigin(o);
    if (o === 'Équipement installé') {
      // Simulate prefill
      setFormData(prev => ({
        ...prev,
        clientName: 'TechCorp Industries',
        projectName: 'Déploiement Serveurs',
        siteName: 'Datacenter Paris',
        equipmentName: 'Serveur Principal BD',
        productName: 'Serveur rack DL380',
        productReference: 'SRV-RACK-001',
        serialNumber: 'SN-98754DF',
        deliveryNumber: 'BL-2026-0089',
        warrantyStatus: 'Sous garantie',
      }));
      setWarrantyStartDate('2025-01-15');
      setWarrantyEndDate('2028-01-15');
      setManufacturer('HP Enterprise');
      setWarrantyConditions('Remplacement J+1');
      setReportedState('Ne démarre plus (voyant alim rouge)');
    } else {
      setFormData(prev => ({
        ...prev,
        clientName: '',
        projectName: '',
        siteName: '',
        equipmentName: '',
        productName: '',
        productReference: '',
        serialNumber: '',
        deliveryNumber: '',
        warrantyStatus: 'À vérifier',
      }));
      setWarrantyStartDate('');
      setWarrantyEndDate('');
      setManufacturer('');
      setWarrantyConditions('');
      setReportedState('');
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.clientName) newErrors.clientName = 'Requis';
    if (!formData.equipmentName && !formData.productName) newErrors.productName = 'Produit ou équipement requis';
    if (!formData.serialNumber) newErrors.serialNumber = 'Requis pour la traçabilité';
    if (!formData.reason) newErrors.reason = 'Requis';
    
    // Simulate active return deduplication
    if (formData.serialNumber === 'SN-ACTIVE-RETURN') {
       newErrors.serialNumber = 'Un retour actif existe déjà pour ce numéro de série';
    }

    // Warranty consistency
    if (formData.warrantyStatus === 'Pris en charge sous garantie' && warrantyEndDate) {
       const end = new Date(warrantyEndDate);
       const now = new Date();
       if (end < now) {
          newErrors.warrantyStatus = 'Garantie expirée mais prise en charge sélectionnée. Veuillez justifier.';
       }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (newStatus: ReturnStatus) => {
    if (newStatus !== 'Brouillon' && !validate()) {
       // Could scroll to errors or show toast
       return;
    }

    const ret: ClientReturn = {
      ...(formData as ClientReturn),
      id: `temp_${Date.now()}`,
      status: newStatus,
      receptionDate: ''
    };

    onSave(ret);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
               <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nouveau retour client</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enregistrer un retour de matériel</p>
             </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
           
           <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-1/3">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                   Créer depuis
                 </label>
                 <CustomSelect 
                   value={origin} 
                   onChange={handleOriginChange}
                   options={ORIGINS.map(o => ({ value: o, label: o }))}
                 />
              </div>
              <div className="flex-1 w-full relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text"
                   placeholder={`Rechercher un ${origin.toLowerCase()}...`}
                   className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 {origin === 'Équipement installé' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-200">
                      Auto-remplir démo
                    </div>
                 )}
              </div>
           </div>

           <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Informations générales</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    N° Retour
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.returnNumber}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => { markChanged(); setFormData({...formData, clientName: e.target.value}); }}
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      errors.clientName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    )}
                  />
                  {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Projet / Affaire
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => { markChanged(); setFormData({...formData, projectName: e.target.value}); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Site client
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => { markChanged(); setFormData({...formData, siteName: e.target.value}); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact client
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => { markChanged(); setContactName(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => { markChanged(); setContactPhone(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date de la demande
                  </label>
                  <input
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => { markChanged(); setFormData({...formData, requestDate: e.target.value}); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Responsable interne
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => { markChanged(); setFormData({...formData, technician: e.target.value}); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priorité
                  </label>
                  <CustomSelect 
                    value={priority}
                    onChange={(v) => { markChanged(); setPriority(v); }}
                    options={[{value:'Basse', label:'Basse'}, {value:'Moyenne', label:'Moyenne'}, {value:'Haute', label:'Haute'}, {value:'Urgente', label:'Urgente'}]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type de retour
                  </label>
                  <CustomSelect 
                    value={formData.returnType || ''}
                    onChange={(v) => { markChanged(); setFormData({...formData, returnType: v}); }}
                    options={[
                      'Retour pour diagnostic', 
                      'Retour sous garantie', 
                      'Retour pour réparation', 
                      'Retour pour remplacement', 
                      'Retour après erreur de livraison', 
                      'Retour définitif'
                    ].map(t => ({value: t, label: t}))}
                  />
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Box className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Équipement retourné</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => { markChanged(); setFormData({...formData, productName: e.target.value}); }}
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      errors.productName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    )}
                  />
                  {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={formData.productReference}
                    onChange={(e) => { markChanged(); setFormData({...formData, productReference: e.target.value}); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de série <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => { markChanged(); setFormData({...formData, serialNumber: e.target.value}); }}
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono",
                      errors.serialNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    )}
                  />
                  {errors.serialNumber && <p className="text-xs text-red-500 mt-1">{errors.serialNumber}</p>}
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        État déclaré par le client
                      </label>
                      <textarea
                        value={reportedState}
                        onChange={(e) => { markChanged(); setReportedState(e.target.value); }}
                        rows={2}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Accessoires retournés
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Câble d'alimentation, télécommande..."
                        value={returnedAccessories}
                        onChange={(e) => { markChanged(); setReturnedAccessories(e.target.value); }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                           type="checkbox" 
                           checked={packagingPresent}
                           onChange={(e) => setPackagingPresent(e.target.checked)}
                           className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Emballage d'origine présent</span>
                      </label>
                    </div>
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Photos et documents (simulation)
                      </label>
                      <div className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500">
                          <Camera className="w-6 h-6" />
                          <span className="text-sm font-medium">Glisser des photos ou cliquer ici</span>
                        </div>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Commentaire / Obversations produit
                      </label>
                      <textarea
                        value={productComment}
                        onChange={(e) => { markChanged(); setProductComment(e.target.value); }}
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
                        placeholder="Traces de chocs, étiquette abimée..."
                      />
                   </div>
                </div>
             </div>
           </div>
           
           <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Motif du retour</h3>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Motif principal <span className="text-red-500">*</span>
                </label>
                <CustomSelect 
                  value={formData.reason || ''}
                  onChange={(v) => { markChanged(); setFormData({...formData, reason: v as ReturnReason}); }}
                  options={[
                    'Panne totale',
                    'Dysfonctionnement intermittent',
                    'Produit endommagé',
                    'Produit non conforme',
                    'Mauvaise référence livrée',
                    'Accessoire manquant',
                    'Échec des tests d\'installation',
                    'Remplacement demandé',
                    'Autre'
                  ].map(t => ({value: t, label: t}))}
                />
                {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description détaillée du problème
                </label>
                <textarea
                  value={reasonDescription}
                  onChange={(e) => { markChanged(); setReasonDescription(e.target.value); }}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date d'apparition du problème
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => { markChanged(); setIssueDate(e.target.value); }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Niveau d'urgence
                    </label>
                    <CustomSelect 
                      value={issueUrgency}
                      onChange={(v) => { markChanged(); setIssueUrgency(v); }}
                      options={[{value: 'Faible', label: 'Faible'}, {value: 'Normale', label: 'Normale'}, {value: 'Critique (Bloquant)', label: 'Critique (Bloquant)'}]}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Conditions d'apparition du problème
                    </label>
                    <input
                      type="text"
                      value={issueConditions}
                      onChange={(e) => { markChanged(); setIssueConditions(e.target.value); }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Solution temporaire appliquée
                    </label>
                    <input
                      type="text"
                      value={temporarySolution}
                      onChange={(e) => { markChanged(); setTemporarySolution(e.target.value); }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Garantie</h3>
             </div>
             
             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Décision provisoire
                  </label>
                  <CustomSelect 
                    value={formData.warrantyStatus || ''}
                    onChange={(v) => { markChanged(); setFormData({...formData, warrantyStatus: v as any}); }}
                    options={['Pris en charge sous garantie', 'Hors garantie', 'À vérifier', 'Exclu de la garantie'].map(t => ({value: t, label: t}))}
                  />
                  {errors.warrantyStatus && <p className="text-xs text-red-500 mt-1">{errors.warrantyStatus}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Début garantie
                  </label>
                  <input
                    type="date"
                    value={warrantyStartDate}
                    onChange={(e) => { markChanged(); setWarrantyStartDate(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fin garantie
                  </label>
                  <input
                    type="date"
                    value={warrantyEndDate}
                    onChange={(e) => { markChanged(); setWarrantyEndDate(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fournisseur / Constructeur
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => { markChanged(); setManufacturer(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conditions principales de la garantie
                  </label>
                  <input
                    type="text"
                    value={warrantyConditions}
                    onChange={(e) => { markChanged(); setWarrantyConditions(e.target.value); }}
                    placeholder="Ex: Remplacement à neuf sous 48h, retour atelier à la charge du client..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Factory className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Organisation du retour</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mode de récupération
                  </label>
                  <CustomSelect 
                    value={recoveryMethod}
                    onChange={(v) => { markChanged(); setRecoveryMethod(v); }}
                    options={['Enlèvement sur site', 'Dépôt par le client', 'Récupéré par technicien', 'Transporteur'].map(t => ({value: t, label: t}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date prévue
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => { markChanged(); setExpectedReturnDate(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entrepôt / Zone de destination
                  </label>
                  <CustomSelect 
                    value={formData.warehouseZone || ''}
                    onChange={(v) => { markChanged(); setFormData({...formData, warehouseZone: v}); }}
                    options={['Quarantaine', 'Atelier SAV Paris', 'Atelier SAV Lyon', 'Stock Central', 'Direct Fournisseur'].map(t => ({value: t, label: t}))}
                  />
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Consignes de transport
                  </label>
                  <input
                    type="text"
                    value={transportInstructions}
                    onChange={(e) => { markChanged(); setTransportInstructions(e.target.value); }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
             </div>
           </div>

        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => handleSubmit('Brouillon')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Brouillon
          </button>
          <button
            onClick={() => handleSubmit('Demande enregistrée')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Enregistrer la demande
          </button>
          <button
            onClick={() => handleSubmit('En attente de réception')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Package className="w-4 h-4" />
            Enregistrer et préparer la réception
          </button>
        </div>
        
        {/* Confirm Close Dialog */}
        <AnimatePresence>
          {showConfirmClose && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm rounded-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Abandonner la création ?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Vos modifications seront perdues.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button
                    onClick={cancelClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                  >
                    Reprendre l'édition
                  </button>
                  <button
                    onClick={confirmClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Ignorer les modifications
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
