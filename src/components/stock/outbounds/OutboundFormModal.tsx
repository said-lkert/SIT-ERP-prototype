import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Calendar, FileText, Upload, CheckCircle2, AlertTriangle, Trash2, X, Hash, LogOut, WandSparkles
} from 'lucide-react';
import { cn, safeFormatDate } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from '../../ui/CustomSelect';
import { useModules } from '../../../contexts/ModuleContext';
import { api } from '../../../api';

interface OutboundFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface OutboundLine {
  id: string;
  reservationLineId?: string;
  productId: string;
  productName: string;
  refProduct: string;
  qteDemande: number;
  qteSortie: number;
  prixU: number;
  emplacementDorigine: string;
  etat: 'Neuf' | 'Occasion' | 'Abîmé';
  serials: string;
  isSerialized: boolean;
  availableStock: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

const LOCATION_OPTIONS = [
  { value: 'loc1', label: 'EMPL-A-01 — Stock actif' }
];

const ETAT_OPTIONS = [
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Occasion', label: 'Occasion' },
  { value: 'Abîmé', label: 'Abîmé' }
];

const DESTINATION_TYPE_OPTIONS = [
  { value: 'Projet', label: 'Projet' },
  { value: 'Client', label: 'Client' },
  { value: 'Technicien', label: 'Technicien' },
  { value: 'SAV', label: 'SAV' },
  { value: 'Perte/Casse', label: 'Perte/Casse' }
];

export function OutboundFormModal({ isOpen, onClose, onSubmit }: OutboundFormModalProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [lines, setLines] = useState<OutboundLine[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [outboundInfo, setOutboundInfo] = useState({
    destinationType: 'Projet',
    destinationName: '',
    date: new Date().toISOString().split('T')[0],
    warehouseId: 'Dépôt Principal',
    responsible: 'Admin',
    reason: '',
    projetId: '',
    reservationId: ''
  });

  const [productsList, setProductsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [reservationsList, setReservationsList] = useState<any[]>([]);

  const [activeSerialLine, setActiveSerialLine] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getProducts(), api.getProjects(), api.getReservations()])
        .then(([prod, proj, reservations]) => {
          setProductsList(prod);
          setProjectsList(proj);
          setReservationsList(reservations);
        }).catch(console.error);
        
      if (lines.length === 0) {
        handleAddLine();
        setOutboundInfo({
          destinationType: 'Projet',
          destinationName: '',
          date: new Date().toISOString().split('T')[0],
          warehouseId: 'Dépôt Principal',
          responsible: 'Admin',
          reason: '',
          projetId: '',
          reservationId: ''
        });
        setDocuments([]);
      }
    }
  }, [isOpen]);

  const handleAddLine = () => {
    const newLine: OutboundLine = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      refProduct: '',
      qteDemande: 1,
      qteSortie: 1,
      prixU: 0,
      emplacementDorigine: 'A-01',
      etat: 'Neuf',
      serials: '',
      isSerialized: false
      ,availableStock: 0
    };
    setLines(prev => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const handleUpdateLine = (id: string, updates: Partial<OutboundLine>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleSelectProduct = (lineId: string, productId: string) => {
    const product = productsList.find(p => p.id === productId);
    if (product) {
      handleUpdateLine(lineId, {
        productId: product.id,
        productName: product.name,
        refProduct: product.reference,
        prixU: product.purchasePrice || 0,
        isSerialized: product.requiresSerialNumber === true && serialNumbersEnabled,
        availableStock: product.availableStock || 0
      });
    }
  };

  const fillReservedProductsForProject = (projectId: string) => {
    const project = projectsList.find((item) => item.id === projectId);
    const reservation = reservationsList.find((item) =>
      item.projectId === projectId
      && ['Réservée', 'Partiellement réservée'].includes(item.status)
    );
    const reservedProducts = (reservation?.products || []).filter((item: any) => Number(item.remainingQty ?? item.reservedQty ?? 0) > 0);

    setOutboundInfo({
      ...outboundInfo,
      destinationType: 'Projet',
      projetId: projectId,
      reservationId: reservation?.id || '',
      destinationName: project?.name || reservation?.projectName || '',
      reason: reservation
        ? `Sortie liée à la réservation ${reservation.reference} du projet ${reservation.projectName || project?.name}.`
        : ''
    });

    if (!reservation || reservedProducts.length === 0) {
      setLines([]);
      setFormError('Aucune réservation active avec des quantités disponibles pour ce projet.');
      return;
    }

    const nextLines = reservedProducts.map((needProduct: any, index: number) => {
      const product = productsList.find((item) => item.id === needProduct.productId);
      const reservedQty = Math.max(1, Number(needProduct.remainingQty ?? needProduct.reservedQty ?? 1));

      return {
        id: `project-reserved-${projectId}-${needProduct.productId}-${index}`,
        reservationLineId: needProduct.id,
        productId: needProduct.productId,
        productName: needProduct.productName || product?.name || '',
        refProduct: needProduct.productReference || product?.reference || '',
        qteDemande: Number(needProduct.requestedQty || reservedQty),
        qteSortie: reservedQty,
        prixU: product?.purchasePrice || product?.sellingPrice || 0,
        emplacementDorigine: needProduct.location === 'EMPL-A-01' ? 'loc1' : 'loc1',
        etat: 'Neuf' as const,
        serials: '',
        isSerialized: (product?.requiresSerialNumber === true || product?.serialized === true || needProduct.isSerialized === true) && serialNumbersEnabled,
        availableStock: reservedQty
      };
    });

    setLines(nextLines);
    setFormError('');
  };

  const stats = useMemo(() => {
    const nbLines = lines.filter(l => l.productId).length;
    const qteTotal = lines.reduce((acc, l) => acc + (Number(l.qteSortie) || 0), 0);
    const valeurTotal = lines.reduce((acc, l) => acc + ((Number(l.qteSortie) || 0) * (Number(l.prixU) || 0)), 0);
    const serialsCount = lines.reduce((acc, l) => acc + (l.serials ? l.serials.split('\n').filter(s => s.trim()).length : 0), 0);
    return { nbLines, qteTotal, valeurTotal, serialsCount };
  }, [lines]);

  const handleAddMockFile = () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Bon_Sortie_${Math.floor(Math.random() * 10000)}.pdf`,
      type: 'PDF',
      size: '1.2 MB',
      date: safeFormatDate(new Date().toISOString())
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleDemoFill = () => {
    const project = projectsList[0];
    const demoProducts = productsList.filter((product) => (product.availableStock || 0) > 0).slice(0, 2);
    const demoCode = Date.now().toString().slice(-6);
    setOutboundInfo({
      destinationType: project ? 'Projet' : 'Technicien',
      destinationName: project?.name || 'Équipe technique A',
      date: new Date().toISOString().split('T')[0],
      warehouseId: 'Dépôt Principal',
      responsible: 'Magasinier',
      reason: `Sortie de démonstration ${demoCode} préparée pour l'affectation au projet.`,
      projetId: project?.id || '',
      reservationId: ''
    });
    setLines(demoProducts.map((product, index) => ({
      id: `demo-outbound-${product.id}-${index}`,
      productId: product.id,
      productName: product.name,
      refProduct: product.reference,
      qteDemande: 1,
      qteSortie: 1,
      prixU: product.purchasePrice || 0,
      emplacementDorigine: 'loc1',
      etat: 'Neuf',
      serials: product.requiresSerialNumber === true && serialNumbersEnabled ? `SN-${product.reference}-${demoCode}-001` : '',
      isSerialized: product.requiresSerialNumber === true && serialNumbersEnabled,
      availableStock: product.availableStock || 0
    })));
    setFormError('');
  };

  const submitOutbound = async (status: 'Brouillon' | 'Validée') => {
    setFormError('');
    const selectedLines = lines.filter((line) => line.productId);
    if (!outboundInfo.destinationName || selectedLines.length === 0) {
      setFormError('Sélectionnez une destination et au moins un produit.');
      return;
    }
    const invalidLine = selectedLines.find((line) => line.qteSortie <= 0 || line.qteSortie > line.availableStock);
    if (status === 'Validée' && invalidLine) {
      setFormError(`Stock insuffisant ou quantité invalide pour ${invalidLine.productName}. Disponible : ${invalidLine.availableStock}.`);
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
         projetId: outboundInfo.destinationType === 'Projet' ? outboundInfo.projetId : null,
         originId: outboundInfo.destinationType === 'Projet' ? outboundInfo.reservationId : null,
         type: outboundInfo.destinationType,
         destinationName: outboundInfo.destinationName,
         demandeur: outboundInfo.responsible,
         date: outboundInfo.date,
         warehouseId: outboundInfo.warehouseId,
         statut: status,
         commentaire: outboundInfo.reason,
         produits: selectedLines.map(l => ({
            productId: l.productId,
            reservationLineId: l.reservationLineId,
            qteDemande: l.qteDemande,
            qteSortie: l.qteSortie,
            locationId: l.emplacementDorigine,
            etat: l.etat,
            serials: l.serials.split('\n').map((serial) => serial.trim()).filter(Boolean)
         }))
      };

      const response = await api.createOutbound(payload);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible de créer la sortie.');

      const refreshedOutbounds = await api.getOutbounds();
      const createdOutbound = Array.isArray(refreshedOutbounds)
        ? refreshedOutbounds.find((outbound: any) => outbound.id === result.id)
        : null;

      setIsProcessing(false);
      setIsSuccess(status === 'Validée');
      setTimeout(() => {
        onSubmit(createdOutbound || result);
        setIsSuccess(false);
        setLines([]);
        onClose();
      }, status === 'Validée' ? 1200 : 0);
    } catch(err) {
      setFormError((err as Error).message);
      setIsProcessing(false);
    }
  };

  const getStatusStyle = (etat: string) => {
    switch (etat) {
      case 'Neuf': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Occasion': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Abîmé': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
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
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[200] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sortie validée !</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">Le stock a été diminué et les mouvements de sortie enregistrés.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nouvelle sortie stock</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                Enregistrer une sortie de matériel
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDemoFill} disabled={!productsList.length} className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 hover:bg-indigo-100 disabled:opacity-40">
                <WandSparkles className="w-4 h-4" /> Remplir la démo
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-slate-900">
            
            {/* Section 1: Informations sortie */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">1. Informations générales de sortie</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="xl:col-span-1 border-r border-slate-100 dark:border-slate-800/50 pr-2">
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Destination *</label>
                       <CustomSelect 
                          value={outboundInfo.destinationType}
                          onChange={(val) => setOutboundInfo({...outboundInfo, destinationType: val})}
                          options={DESTINATION_TYPE_OPTIONS}
                       />
                   </div>
                   <div>
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Nom / Entité de destination *</label>
                       {outboundInfo.destinationType === 'Projet' ? (
                          <CustomSelect 
                             value={outboundInfo.projetId}
                              onChange={(val) => fillReservedProductsForProject(val)}
                             options={projectsList.map(p => ({ value: p.id, label: `${p.name} - ${p.clientName}` }))}
                             placeholder="Sélectionner un projet..."
                          />
                       ) : (
                         <input 
                           type="text" 
                           placeholder="Hôtel El Aurassi, Clinique X..." 
                           value={outboundInfo.destinationName}
                           onChange={(e) => setOutboundInfo({...outboundInfo, destinationName: e.target.value})}
                           className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm" 
                         />
                       )}
                   </div>
                   <div>
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Date sortie</label>
                       <div className="relative">
                           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input 
                             type="date" 
                             value={outboundInfo.date}
                             onChange={(e) => setOutboundInfo({...outboundInfo, date: e.target.value})}
                             className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm" 
                           />
                       </div>
                   </div>
                   <div>
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Dépôt source</label>
                       <CustomSelect 
                         value={outboundInfo.warehouseId}
                         onChange={(val) => setOutboundInfo({...outboundInfo, warehouseId: val})}
                         options={[
                           { value: 'Dépôt Principal', label: 'Dépôt Principal' },
                           { value: 'Dépôt Alger', label: 'Dépôt Alger' },
                           { value: 'SAV / Quarantaine', label: 'SAV / Quarantaine' }
                         ]}
                       />
                   </div>
                   <div>
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Responsable</label>
                       <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400">
                          {outboundInfo.responsible}
                       </div>
                   </div>
                   <div>
                       <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Motif / Commentaire</label>
                       <input 
                         type="text" 
                         placeholder="..." 
                         value={outboundInfo.reason}
                         onChange={(e) => setOutboundInfo({...outboundInfo, reason: e.target.value})}
                         className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm" 
                       />
                   </div>
               </div>
            </section>

            {/* Section 2: Produits à sortir */}
            <section className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">2. Détail des produits à sortir</h3>
                   </div>
                   <button 
                     onClick={handleAddLine}
                     className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all uppercase tracking-widest shadow-md shadow-indigo-500/20"
                   >
                      <Plus className="w-4 h-4" /> Ajouter un produit
                   </button>
                </div>
                
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[200px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm table-fixed divide-y divide-slate-100 dark:divide-slate-800 min-w-[1000px]">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-[0.15em] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="w-[35%] px-6 py-4">Produit / Référence</th>
                                    <th className="w-[8%] px-4 py-4 text-center">Qté Demandée</th>
                                    <th className="w-[8%] px-4 py-4 text-center">Qté Sortie</th>
                                    <th className="w-[12%] px-4 py-4 text-right">Valeur Unitaire (HT)</th>
                                    <th className="w-[15%] px-4 py-4">Emplacement source</th>
                                    <th className="w-[15%] px-4 py-4">État</th>
                                    <th className="w-[7%] px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {lines.map((l) => (
                                    <tr 
                                      key={l.id}
                                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2">
                                              <CustomSelect 
                                                 value={l.productId}
                                                 onChange={(val) => handleSelectProduct(l.id, val)}
                                                 options={productsList.map(p => ({ value: p.id, label: p.name }))}
                                                 placeholder="Rechercher un produit..."
                                                 className="h-10 text-sm font-bold"
                                              />
                                              {l.refProduct && (
                                                 <div className="flex items-center gap-2 ml-1">
                                                    <span className="text-[10px] font-black text-white bg-slate-400 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">{l.refProduct}</span>
                                                    <span className={cn("text-[10px] font-bold uppercase", l.qteSortie > l.availableStock ? "text-red-600" : "text-emerald-600")}>
                                                      Disponible : {l.availableStock}
                                                    </span>
                                                 </div>
                                              )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <input 
                                              type="number" 
                                              value={l.qteDemande} 
                                              onChange={(e) => handleUpdateLine(l.id, { qteDemande: Number(e.target.value) })}
                                              className="w-full h-10 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex flex-col gap-1 items-center">
                                                <input 
                                                  type="number" 
                                                  value={l.qteSortie} 
                                                  onChange={(e) => handleUpdateLine(l.id, { qteSortie: Number(e.target.value) })}
                                                  className={cn(
                                                    "w-full h-10 px-2 bg-white dark:bg-slate-900 border rounded-xl text-center font-black text-sm focus:ring-2 transition-all shadow-sm outline-none",
                                                    l.qteSortie > l.availableStock ? "border-red-400 text-red-600 bg-red-50 focus:ring-red-500/10" : Number(l.qteSortie) !== Number(l.qteDemande) ? "border-amber-400 text-amber-600 bg-amber-50 focus:ring-amber-500/10" : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500/10 focus:border-emerald-500 border-2"
                                                  )}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="relative">
                                               <input 
                                                 type="number" 
                                                 value={l.prixU} 
                                                 onChange={(e) => handleUpdateLine(l.id, { prixU: Number(e.target.value) })}
                                                 className="w-full h-10 pl-3 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-right text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-mono appearance-none"
                                                 readOnly
                                               />
                                               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">DA</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <CustomSelect 
                                               value={l.emplacementDorigine}
                                               onChange={(val) => handleUpdateLine(l.id, { emplacementDorigine: val })}
                                               options={LOCATION_OPTIONS}
                                               className="h-10 text-xs font-bold"
                                            />
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                             <CustomSelect 
                                               value={l.etat}
                                               onChange={(val) => handleUpdateLine(l.id, { etat: val as any })}
                                               options={ETAT_OPTIONS}
                                               className={cn("h-10 text-[11px] font-bold", getStatusStyle(l.etat))}
                                            />
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-2 h-10">
                                                {l.isSerialized && (
                                                   <button 
                                                      onClick={() => setActiveSerialLine(l.id)}
                                                      className={cn(
                                                        "p-2.5 rounded-xl border transition-all hover:scale-105 shadow-sm",
                                                        l.serials ? "bg-indigo-600 text-white border-indigo-500" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                                                      )}
                                                      title="Numéros de série sélectionnés"
                                                   >
                                                     <Hash className="w-4 h-4"/>
                                                   </button>
                                                )}
                                                <button 
                                                  onClick={() => handleRemoveLine(l.id)} 
                                                  className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-500 border border-transparent rounded-xl transition-all shadow-sm group/del"
                                                  title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {lines.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center bg-slate-50/10 flex-col items-center justify-center">
                                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest italic">Aucun produit à sortir pour le moment</p>
                                      <div className="flex justify-center mt-2">
                                        <button onClick={handleAddLine} className="text-indigo-600 font-bold hover:underline text-xs uppercase tracking-widest">Sélectionner des produits</button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Section 3: Documents liés */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Documents liés</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm min-h-[140px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AnimatePresence initial={false}>
                              {documents.map(doc => (
                                <motion.div 
                                  key={doc.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg group transition-all hover:border-slate-300 dark:hover:border-slate-600"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50 text-rose-600">
                                            <FileText className="w-4 h-4"/>
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{doc.type} • {doc.size}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveDoc(doc.id)} className="p-1 px-2 text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5"/>
                                    </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {documents.length === 0 && (
                              <button 
                                onClick={handleAddMockFile}
                                className="md:col-span-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                              >
                                  <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Joindre un document (Demande, BL...)</p>
                              </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section 4: Résumé sortie */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Résumé sortie</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-slate-400">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantité totale sortie</p>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.qteTotal} <span className="text-xs font-medium text-slate-400 uppercase ml-1">Unités</span></span>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-600">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Valeur estimée (HT)</p>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">{stats.valeurTotal.toLocaleString()} <span className="text-xs font-medium text-slate-400 uppercase ml-1">DA</span></span>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre de produits</p>
                            <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 tracking-tight">{stats.nbLines}</span>
                        </div>
                        {serialNumbersEnabled && (
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-400">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">N° de série sélectionnés</p>
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">{stats.serialsCount}</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shadow-inner">
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-all uppercase tracking-widest"
              >
                  Annuler
              </button>
              <div className="flex items-center gap-3">
                  <button
                    onClick={() => submitOutbound('Brouillon')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-all uppercase tracking-widest"
                  >
                      Enregistrer Brouillon
                  </button>
                  <button 
                    onClick={() => submitOutbound('Validée')}
                    disabled={lines.filter(l=>l.productId).length === 0 || !outboundInfo.destinationName || isProcessing}
                    className="flex items-center gap-2 px-6 py-2 text-[11px] font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all uppercase tracking-widest"
                  >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4"/> 
                                Valider sortie
                            </>
                        )}
                  </button>
              </div>
          </div>
          {formError && (
            <div className="absolute bottom-20 left-1/2 z-50 w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-lg">
              {formError}
            </div>
          )}
        </motion.div>

        {/* Serial Entry Dialog */}
        <AnimatePresence>
            {activeSerialLine && (
                <div className="absolute inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                      onClick={() => setActiveSerialLine(null)}
                    />
                    <motion.div
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sélection Numéros de série</h4>
                            <button onClick={() => setActiveSerialLine(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 font-medium italic">Saisissez les numéros de série que vous souhaitez sortir. Un numéro par ligne. Scanneur supporté.</p>
                        <textarea 
                          value={lines.find(l => l.id === activeSerialLine)?.serials || ''}
                          onChange={(e) => handleUpdateLine(activeSerialLine, { serials: e.target.value })}
                          rows={10}
                          placeholder="S/N-001&#10;S/N-002..."
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all resize-none dark:text-indigo-400"
                        />
                        <button 
                            onClick={() => setActiveSerialLine(null)}
                            className="mt-6 w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all font-bold"
                        >
                            Confirmer la sélection
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </AnimatePresence>,
    document.body
  );
}
