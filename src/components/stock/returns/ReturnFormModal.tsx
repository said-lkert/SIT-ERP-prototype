import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Calendar, FileText, Upload, CheckCircle2, AlertTriangle, Trash2, X, Hash, Info, ListChecks, AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from '../../ui/CustomSelect';

interface ReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, status: 'Brouillon' | 'Validé') => void;
}

interface ReturnFormLine {
  id: string;
  productId: string;
  productName: string;
  refProduct: string;
  qty: number;
  prixU: number;
  sourceLoc: string;
  condition: 'Neuf' | 'Occasion' | 'Abîmé';
  decision: 'Échange' | 'Remboursement' | 'Réparation' | 'Avoir';
  serials: string;
  isSerialized: boolean;
  isLinkedToInstalledEquipment?: boolean;
}

interface DocumentUpload {
  id: string;
  type: string;
  name: string;
  size: string;
}

const MOCK_PRODUCTS = [
  { id: '1', name: 'Hikvision DS-2CD2143G0-I', ref: 'DS-2CD2143G0-I', price: 15000, isSerialized: true },
  { id: '2', name: 'Switch PoE 8 Ports TP-Link', ref: 'TL-SF1008P', price: 8500, isSerialized: true },
  { id: '3', name: 'Disque Dur WD Purple 4TB', ref: 'WD40PURX', price: 14000, isSerialized: true },
  { id: '4', name: 'Câble RJ45 Cat6 305m', ref: 'CAB-RJ45-C6', price: 9500, isSerialized: false },
  { id: '5', name: 'Routeur MikroTik hEX lite', ref: 'ROUT-MIK', price: 8000, isSerialized: true },
];

const LOCATION_OPTIONS = [
  { value: 'Zone SAV', label: 'Zone SAV' },
  { value: 'SAV-01', label: 'SAV-01' },
  { value: 'Dépôt Principal', label: 'Dépôt Principal' },
  { value: 'Dépôt Alger', label: 'Dépôt Alger' },
];

const CONDITION_OPTIONS = [
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Occasion', label: 'Occasion' },
  { value: 'Abîmé', label: 'Abîmé' }
];

const DECISION_OPTIONS = [
  { value: 'Échange', label: 'Échange' },
  { value: 'Remboursement', label: 'Remboursement' },
  { value: 'Réparation', label: 'Réparation' },
  { value: 'Avoir', label: 'Avoir' }
];

const SUPPLIER_OPTIONS = [
  { value: 'Hikvision France', label: 'Hikvision France' },
  { value: 'Schneider Electric', label: 'Schneider Electric' },
  { value: 'TP-Link Distri', label: 'TP-Link Distri' },
  { value: 'Dahua Security', label: 'Dahua Security' },
  { value: 'MikroTik Distri', label: 'MikroTik Distri' },
  { value: 'Nexans Tunisie', label: 'Nexans Tunisie' }
];

const MOTIF_OPTIONS = [
  { value: 'Panne', label: 'Panne' },
  { value: 'Abîmé à la réception', label: 'Abîmé à la réception' },
  { value: 'Erreur de livraison', label: 'Erreur de livraison' },
  { value: 'Garantie', label: 'Garantie / RMA' },
  { value: 'Échange', label: 'Échange fournisseur' },
  { value: 'Avoir', label: 'Avoir financier' }
];

export function ReturnFormModal({ isOpen, onClose, onSubmit }: ReturnFormModalProps) {
  const [lines, setLines] = useState<ReturnFormLine[]>([]);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [returnInfo, setReturnInfo] = useState({
    supplierName: 'Hikvision France',
    motif: 'Garantie',
    date: new Date().toISOString().split('T')[0],
    warehouseName: 'Zone SAV',
    linkedReceipt: '',
    responsible: 'Ahmed.K',
    comment: ''
  });

  const [activeSerialLine, setActiveSerialLine] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successStatus, setSuccessStatus] = useState<'Brouillon' | 'Validé'>('Brouillon');

  useEffect(() => {
    if (isOpen) {
      // Start with one product line by default
      const newLine: ReturnFormLine = {
        id: Math.random().toString(36).substr(2, 9),
        productId: '',
        productName: '',
        refProduct: '',
        qty: 1,
        prixU: 0,
        sourceLoc: 'Zone SAV',
        condition: 'Abîmé',
        decision: 'Échange',
        serials: '',
        isSerialized: false,
        isLinkedToInstalledEquipment: false
      };
      setLines([newLine]);
      setReturnInfo({
        supplierName: 'Hikvision France',
        motif: 'Garantie',
        date: new Date().toISOString().split('T')[0],
        warehouseName: 'Zone SAV',
        linkedReceipt: '',
        responsible: 'Ahmed.K',
        comment: ''
      });
      setDocuments([]);
    }
  }, [isOpen]);

  const handleAddLine = () => {
    const newLine: ReturnFormLine = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      refProduct: '',
      qty: 1,
      prixU: 0,
      sourceLoc: 'Zone SAV',
      condition: 'Abîmé',
      decision: 'Échange',
      serials: '',
      isSerialized: false,
      isLinkedToInstalledEquipment: false
    };
    setLines(prev => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const handleUpdateLine = (id: string, updates: Partial<ReturnFormLine>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleSelectProduct = (lineId: string, productId: string) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      // Simulate that some specific serial query links it to installed customer equipment
      const isLinked = product.isSerialized && (product.id === '1' || product.id === '5');

      handleUpdateLine(lineId, {
        productId: product.id,
        productName: product.name,
        refProduct: product.ref,
        prixU: product.price,
        isSerialized: product.isSerialized,
        isLinkedToInstalledEquipment: isLinked
      });
    }
  };

  const stats = useMemo(() => {
    const totalLines = lines.filter(l => l.productId).length;
    const qtyTotal = lines.reduce((acc, l) => acc + (Number(l.qty) || 0), 0);
    const valTotal = lines.reduce((acc, l) => acc + ((Number(l.qty) || 0) * (Number(l.prixU) || 0)), 0);
    const serialsCount = lines.reduce((acc, l) => {
      if (!l.isSerialized || !l.serials) return acc;
      return acc + l.serials.split('\n').filter(s => s.trim()).length;
    }, 0);
    return { totalLines, qtyTotal, valTotal, serialsCount };
  }, [lines]);

  const handleAddDemoFile = (type: string) => {
    const docNameMap: Record<string, string> = {
      'accord': 'RMA_Accord_Fournisseur_Approuvé.pdf',
      'facture': 'Facture_Fournisseur_Initiale_7112.pdf',
      'bl': 'BL_Fournisseur_Livraison_8801.pdf',
      'photo': 'Photos_Defectueux_Capteur_BancTest_1.png',
      'garantie': 'Certificat_Garantie_Constructeur.pdf'
    };
    
    const docName = docNameMap[type] || 'Justificatif_Demo.pdf';
    const finalType = type === 'accord' ? 'Accord retour fournisseur' : 
                     type === 'facture' ? 'Facture fournisseur' : 
                     type === 'bl' ? 'Bon de livraison fournisseur initial' : 
                     type === 'photo' ? 'Photos produit abîmé' : 'Certificat de garantie';

    const newDoc: DocumentUpload = {
      id: Math.random().toString(36).substr(2, 9),
      name: docName,
      type: finalType,
      size: '1.4 MB'
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleTriggerSubmit = (status: 'Brouillon' | 'Validé') => {
    setIsProcessing(true);
    setSuccessStatus(status);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSubmit({
          ...returnInfo,
          products: lines.filter(l => l.productId),
          documents,
          totalQty: stats.qtyTotal,
          totalValue: stats.valTotal
        }, status);
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop blur exactly matching rules */}
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
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Success Overlay matching exact prompt actions */}
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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                  {successStatus === 'Validé' ? 'Retour validé avec succès !' : 'Brouillon enregistré !'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md text-xs font-semibold uppercase tracking-widest mt-1">
                  {successStatus === 'Validé' ? 'Le stock disponible a été mis à jour et un bordereau RMA a été consigné.' : 'Ce retour est enregistré de manière transitoire.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
             <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nouveau retour fournisseur</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Créer un bordereau de retour de matériel</p>
             </div>
             <button 
               onClick={onClose}
               className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
               id="close-btn"
             >
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-slate-900">
             
             {/* Section 1: Informations de retour */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">1. Informations générales du retour</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Fournisseur dest. *</label>
                      <CustomSelect 
                        value={returnInfo.supplierName}
                        onChange={(val) => setReturnInfo({...returnInfo, supplierName: val})}
                        options={SUPPLIER_OPTIONS}
                      />
                   </div>
                   <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Motif principal *</label>
                      <CustomSelect 
                        value={returnInfo.motif}
                        onChange={(val) => setReturnInfo({...returnInfo, motif: val})}
                        options={MOTIF_OPTIONS}
                      />
                   </div>
                   <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date d'expédition</label>
                      <div className="relative">
                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                           type="date" 
                           value={returnInfo.date}
                           onChange={(e) => setReturnInfo({...returnInfo, date: e.target.value})}
                           className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Emplacement source principal</label>
                      <CustomSelect 
                        value={returnInfo.warehouseName}
                        onChange={(val) => setReturnInfo({...returnInfo, warehouseName: val})}
                        options={LOCATION_OPTIONS}
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Réception liée (optionnelle)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: REC-0021 ou BL-FOURN-XXXX"
                        value={returnInfo.linkedReceipt}
                        onChange={(e) => setReturnInfo({...returnInfo, linkedReceipt: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm"
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Responsable</label>
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400">
                        {returnInfo.responsible} (Logistics Team)
                      </div>
                   </div>
                   <div className="md:col-span-4">
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Commentaires ou détails de la panne</label>
                      <textarea 
                        rows={2}
                        placeholder="Renseignez d'éventuels détails sur le comportement anormal, rapports de diagnostic..."
                        value={returnInfo.comment}
                        onChange={(e) => setReturnInfo({...returnInfo, comment: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-sm"
                      />
                   </div>
                </div>
             </section>

             {/* Section 2: Produits à retourner */}
             <section className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">2. Produits à renvoyer</h3>
                   </div>
                   <button 
                     onClick={handleAddLine}
                     className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all uppercase tracking-widest shadow-md shadow-indigo-500/20 active:scale-95"
                   >
                     <Plus className="w-3.5 h-3.5" /> Ajouter un produit
                   </button>
                </div>
                
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[160px]">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm table-fixed divide-y divide-slate-100 dark:divide-slate-800 min-w-[1000px]">
                         <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                            <tr>
                               <th className="w-[30%] px-6 py-4">Nom du produit</th>
                               <th className="w-[8%] px-4 py-4 text-center">Qté</th>
                               <th className="w-[10%] px-4 py-4 text-center">N° Série</th>
                               <th className="w-[14%] px-4 py-4">Source</th>
                               <th className="w-[12%] px-4 py-4">État physique</th>
                               <th className="w-[16%] px-4 py-4">Décision attendue</th>
                               <th className="w-[7%] px-6 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65">
                            {lines.map((l) => (
                              <tr key={l.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex flex-col gap-2">
                                       <CustomSelect 
                                         value={l.productId}
                                         onChange={(val) => handleSelectProduct(l.id, val)}
                                         options={MOCK_PRODUCTS.map(p => ({ value: p.id, label: p.name }))}
                                         placeholder="Sélectionner produit..."
                                         className="h-10 text-xs font-bold"
                                       />
                                       {l.refProduct && (
                                         <div className="flex items-center gap-2 ml-1">
                                            <span className="text-[10px] font-black text-white bg-slate-500 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">{l.refProduct}</span>
                                            {l.isLinkedToInstalledEquipment && (
                                               <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded-md px-1.5 py-0.5">
                                                  <AlertCircle className="w-3 h-3 text-amber-500" /> lié à équipement installé
                                               </span>
                                            )}
                                         </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 py-4 align-top">
                                    <input 
                                      type="number" 
                                      value={l.qty}
                                      onChange={(e) => handleUpdateLine(l.id, { qty: Math.max(1, Number(e.target.value)) })}
                                      className="w-full h-10 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-950 dark:text-white"
                                    />
                                 </td>
                                 <td className="px-4 py-4 align-top">
                                    <div className="flex justify-center">
                                       {l.isSerialized ? (
                                          <button 
                                            onClick={() => setActiveSerialLine(l.id)}
                                            className={cn(
                                              "p-2.5 h-10 w-10 flex items-center justify-center rounded-xl border transition-all hover:scale-105 shadow-sm",
                                              l.serials ? "bg-indigo-600 text-white border-indigo-500 text-white" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                                            )}
                                            title="Saisir les numéros de série"
                                          >
                                             <Hash className="w-4 h-4 shrink-0" />
                                          </button>
                                       ) : (
                                         <span className="text-xs text-slate-400 dark:text-slate-600 font-mono">-</span>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 py-4 align-top">
                                    <CustomSelect 
                                      value={l.sourceLoc}
                                      onChange={(val) => handleUpdateLine(l.id, { sourceLoc: val })}
                                      options={LOCATION_OPTIONS}
                                      className="h-10 text-xs font-bold"
                                    />
                                 </td>
                                 <td className="px-4 py-4 align-top">
                                    <CustomSelect 
                                      value={l.condition}
                                      onChange={(val) => handleUpdateLine(l.id, { condition: val as any })}
                                      options={CONDITION_OPTIONS}
                                      className="h-10 text-xs font-bold"
                                    />
                                 </td>
                                 <td className="px-4 py-4 align-top">
                                    <CustomSelect 
                                      value={l.decision}
                                      onChange={(val) => handleUpdateLine(l.id, { decision: val as any })}
                                      options={DECISION_OPTIONS}
                                      className="h-10 text-xs font-bold"
                                    />
                                 </td>
                                 <td className="px-6 py-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-2 h-10">
                                       <button 
                                         onClick={() => handleRemoveLine(l.id)}
                                         className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-500 border border-transparent rounded-xl transition-all shadow-sm"
                                         title="Supprimer la ligne"
                                       >
                                          <Trash2 className="w-4 h-4 shrink-0" />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                            {lines.length === 0 && (
                              <tr>
                                 <td colSpan={7} className="px-6 py-12 text-center bg-slate-50/10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Aucune ligne de matériel renseignée</p>
                                    <button onClick={handleAddLine} className="mt-2 text-indigo-600 font-black hover:underline text-xs uppercase tracking-widest flex items-center gap-1 mx-auto">
                                       <Plus className="w-4 h-4" /> Ajouter maintenant
                                    </button>
                                 </td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
             </section>

             {/* Section 3: Documents liés */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">3. Documents obligatoires & Justificatifs liés</h3>
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                   <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-widest">Ajouter un document témoin pour test :</div>
                   <div className="flex flex-wrap gap-2.5">
                      <button 
                         onClick={() => handleAddDemoFile('accord')}
                         className="px-3.5 py-2 hover:indigo-50 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        + Accord retour fournisseur
                      </button>
                      <button 
                         onClick={() => handleAddDemoFile('facture')}
                         className="px-3.5 py-2 hover:indigo-50 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        + Facture fournisseur
                      </button>
                      <button 
                         onClick={() => handleAddDemoFile('bl')}
                         className="px-3.5 py-2 hover:indigo-50 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        + BL fournisseur initial
                      </button>
                      <button 
                         onClick={() => handleAddDemoFile('photo')}
                         className="px-3.5 py-2 hover:indigo-50 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        + Photo produit abîmé
                      </button>
                      <button 
                         onClick={() => handleAddDemoFile('garantie')}
                         className="px-3.5 py-2 hover:indigo-50 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        + Certificat garantie
                      </button>
                   </div>

                   {documents.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                        {documents.map((doc) => (
                           <div key={doc.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl">
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                                 <div className="truncate">
                                    <div className="text-xs font-bold text-slate-800 dark:text-white truncate" title={doc.name}>{doc.name}</div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{doc.type} • {doc.size}</div>
                                 </div>
                              </div>
                              <button onClick={() => handleRemoveDoc(doc.id)} className="p-1 px-1.5 text-slate-400 hover:text-rose-500">
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
             </section>

             {/* Section 4: Résumé du retour */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">4. Résumé dynamique du retour</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-400">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Qté totale matériel</p>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.qtyTotal} <span className="text-xs font-normal opacity-60">Unités</span></span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-600">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre d'articles</p>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalLines}</span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">N° de série saisis</p>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.serialsCount}</span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avoir attendu théorique</p>
                      <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.valTotal.toLocaleString()} <span className="text-xs font-normal opacity-60">DA</span></span>
                   </div>
                </div>
             </section>

          </div>

          {/* Footer inside modal exactly as requested */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shadow-inner">
             <button 
               onClick={onClose} 
               className="px-4 py-2 text-[10px] font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-all uppercase tracking-widest"
             >
                Annuler
             </button>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleTriggerSubmit('Brouillon')}
                  disabled={lines.filter(l => l.productId).length === 0 || isProcessing}
                  className="px-4 py-2 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-all uppercase tracking-widest disabled:opacity-40"
                >
                  Enregistrer Brouillon
                </button>
                <button 
                  onClick={() => handleTriggerSubmit('Validé')}
                  disabled={lines.filter(l => l.productId).length === 0 || isProcessing}
                  className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-55 transition-all uppercase tracking-widest"
                >
                   {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                      <>
                         <CheckCircle2 className="w-4 h-4"/> 
                         Valider le retour
                      </>
                   )}
                </button>
             </div>
          </div>
        </motion.div>

        {/* Serial Entry Overlay */}
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
                       className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Saisie Numéros de Série</h4>
                            <button onClick={() => setActiveSerialLine(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4 font-semibold uppercase tracking-widest leading-relaxed">Saisissez un numéro de série unique par ligne.</p>
                        <textarea 
                          value={lines.find(l => l.id === activeSerialLine)?.serials || ''}
                          onChange={(e) => handleUpdateLine(activeSerialLine, { serials: e.target.value })}
                          rows={6}
                          placeholder="SN-HIKVISION-99A1&#10;SN-HIKVISION-99A2..."
                          className="w-full px-3, py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all resize-none dark:text-indigo-400 pl-3"
                        />
                        <button 
                            onClick={() => setActiveSerialLine(null)}
                            className="mt-6 w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all font-bold"
                        >
                            Valider
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
