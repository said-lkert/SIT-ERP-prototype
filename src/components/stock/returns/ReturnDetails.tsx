import React, { useState, useRef, useEffect } from 'react';
import { SupplierReturn, ReturnStatus, ReturnProduct, ReturnReason } from './types';
import { 
  ArrowLeft, Settings, ChevronDown, Download, FileText, History, 
  Package, User, ShieldAlert, Barcode, Calendar, Box, 
  ExternalLink, Archive, AlertTriangle, CheckCircle2, 
  Clock, Building2, FileCheck, Tag, Info, AlertCircle, Wrench, RefreshCw, Landmark, Trash2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ReturnDetailsProps {
  supplierReturn: SupplierReturn;
  onBack: () => void;
  onEdit?: (ret: SupplierReturn) => void;
  onStatusChange?: (id: string, newStatus: ReturnStatus, eventDetail?: string) => void;
}

export function ReturnDetails({ supplierReturn, onBack, onEdit, onStatusChange }: ReturnDetailsProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);

  // Business Action Modals
  const [showConfirmValider, setShowConfirmValider] = useState(false);
  const [showConfirmAnnuler, setShowConfirmAnnuler] = useState(false);
  const [showConfirmCloturer, setShowConfirmCloturer] = useState(false);
  const [clotureChoice, setClotureChoice] = useState<'Echange' | 'Avoir' | 'ReparationRefusee' | 'Remplacement'>('Echange');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsTitleVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadgeColor = (status: ReturnStatus) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En attente': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Clôturé': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Neuf': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-1.5 py-0.5 rounded';
      case 'Occasion': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-1.5 py-0.5 rounded';
      case 'Abîmé': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 px-1.5 py-0.5 rounded';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const serializedProducts = supplierReturn.products.filter(p => p.isSerialized);

  // Operations triggers
  const executeValider = () => {
    if (onStatusChange) {
      onStatusChange(supplierReturn.id, 'Validé', 'Validation du retour (produit bloqué/retiré du stock). Bon de retour généré.');
    }
    setShowConfirmValider(false);
  };

  const executeAnnuler = () => {
    if (onStatusChange) {
      onStatusChange(supplierReturn.id, 'Annulé', 'Annulation du retour (aucun impact stock).');
    }
    setShowConfirmAnnuler(false);
  };

  const executeCloturer = () => {
    if (onStatusChange) {
      let desc = 'Retour clôturé. ';
      if (clotureChoice === 'Echange') desc += 'Échange fournisseur accepté.';
      else if (clotureChoice === 'Avoir') desc += 'Avoir fournisseur reçu.';
      else if (clotureChoice === 'ReparationRefusee') desc += 'Réparation refusée par le fournisseur.';
      else if (clotureChoice === 'Remplacement') desc += 'Produit remplacé sous garantie.';

      onStatusChange(supplierReturn.id, 'Clôturé', desc);
    }
    setShowConfirmCloturer(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 z-40 transition-all duration-300">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative z-10 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Retour à la liste</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center overflow-hidden max-w-[40%] pointer-events-none z-0">
          <AnimatePresence>
            {!isTitleVisible && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center gap-3 overflow-hidden pointer-events-auto"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">Retour {supplierReturn.reference}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border truncate uppercase tracking-widest", getStatusBadgeColor(supplierReturn.status))}>
                    {supplierReturn.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {supplierReturn.status === 'Brouillon' && (
            <button 
              onClick={() => onEdit?.(supplierReturn)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 transition-colors uppercase tracking-wider"
            >
              Modifier
            </button>
          )}

          {supplierReturn.status === 'Brouillon' && (
            <button 
              onClick={() => setShowConfirmValider(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" /> Valider le retour
            </button>
          )}

          {supplierReturn.status === 'Validé' && (
            <button 
              onClick={() => setShowConfirmCloturer(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" /> Clôturer le retour
            </button>
          )}

          {/* Options Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors uppercase tracking-wider"
            >
              <Settings className="w-4 h-4" />
              Options
              <ChevronDown className={cn("w-4 h-4 transition-transform", isOptionsOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isOptionsOpen && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 5 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: 5 }}
                   className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="p-1.5 text-slate-700 dark:text-slate-300">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                      <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Consulter bon de retour
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                      <Download className="w-4 h-4 text-indigo-500 shrink-0" /> Exporter retour
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                      <History className="w-4 h-4 text-slate-500 shrink-0" /> Historique des changements
                    </button>
                    {supplierReturn.status === 'Brouillon' && (
                      <button 
                        onClick={() => {
                          setIsOptionsOpen(false);
                          setShowConfirmAnnuler(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Annuler retour
                      </button>
                    )}
                    {supplierReturn.status === 'Validé' && (
                      <button
                        onClick={() => {
                          setIsOptionsOpen(false);
                          setShowConfirmCloturer(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-left text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                      >
                         <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-500" /> Clôturer retour
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col lg:flex-row min-h-full">
          {/* Main Content Area */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-6 md:p-8 space-y-6">
            
            {/* Header Title Information Panel */}
            <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div ref={titleRef}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[9px] font-black border uppercase tracking-widest px-2 py-0.5 rounded", getStatusBadgeColor(supplierReturn.status))}>
                    {supplierReturn.status}
                  </span>
                  {supplierReturn.motif && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Motif : {supplierReturn.motif}</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Retour fournisseur {supplierReturn.reference}</h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Crée par {supplierReturn.responsible} le {supplierReturn.date}</p>
              </div>
              <div className="flex gap-4">
                 {/* Top Micro Cards exactly like product design */}
                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">Lignes</div>
                       <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">{supplierReturn.products.length}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Box className="w-4 h-4 text-emerald-500" />
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">Qté Totale</div>
                       <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">{supplierReturn.totalQty}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Landmark className="w-4 h-4 text-amber-500" />
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">Est. Avoir</div>
                       <div className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-none mt-0.5">{supplierReturn.totalValue.toLocaleString()} DA</div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Containers layout */}

            {/* Container 1: Informations Retour */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">1. Informations de retour</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Référence</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 block font-mono bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{supplierReturn.reference}</span>
                </div>
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fournisseur</span>
                   <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 block bg-indigo-50/20 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/10">{supplierReturn.supplierName}</span>
                </div>
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date création</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 block p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">{supplierReturn.date}</span>
                </div>
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Réception source</span>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5 block p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                     {supplierReturn.linkedReceipt || <span className="text-slate-400 dark:text-slate-600 italic">Aucune réception liée</span>}
                   </span>
                </div>
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Emplacement source principal</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 block p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">{supplierReturn.warehouseName}</span>
                </div>
                <div>
                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Responsable logistique</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 block p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">{supplierReturn.responsible}</span>
                </div>
                {supplierReturn.comment && (
                  <div className="sm:col-span-2 lg:col-span-3">
                     <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Commentaire interne</span>
                     <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-1">{supplierReturn.comment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Container 2: Produits retournés */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">2. Détail des produits à retourner</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs table-fixed divide-y divide-slate-100 dark:divide-slate-800/50 min-w-[700px]">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-widest pb-2">
                      <th className="w-[30%] pb-3">Produit</th>
                      <th className="w-[10%] text-center pb-3">Qté</th>
                      <th className="w-[15%] pb-3">Emplacement</th>
                      <th className="w-[12%] pb-3">État physique</th>
                      <th className="w-[18%] pb-3">Motif de retour</th>
                      <th className="w-[15%] pb-3 text-right">Décision attendue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {supplierReturn.products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3">
                           <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                           <span className="text-[10px] font-mono opacity-60 uppercase block mt-0.5">{p.reference}</span>
                           {p.isLinkedToInstalledEquipment && (
                             <span className="inline-flex items-center gap-1.5 mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wide">
                                <AlertCircle className="w-3 h-3" /> Lié à équipement installé cliente
                             </span>
                           )}
                        </td>
                        <td className="text-center font-bold text-slate-900 dark:text-white py-3">{p.qty}</td>
                        <td className="py-3">
                           <span className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">{p.locationName}</span>
                        </td>
                        <td className="py-3">
                          <span className={cn("text-[10px] uppercase font-bold", getConditionColor(p.condition))}>{p.condition}</span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-medium italic">{p.reason}</td>
                        <td className="py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{p.decision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Container 3: Numéros de série */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">3. Traçabilité Unitaire (N° de Série)</h3>
              </div>
              {serializedProducts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serializedProducts.map(p => {
                       return (p.serialNumbers || []).map(sn => (
                         <div key={sn} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="flex items-center gap-2.5">
                               <Barcode className="w-4 h-4 text-purple-600" />
                               <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono tracking-tight">{sn}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.name}</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Statut : RETOUR FR.</div>
                               <div className="text-[9px] text-slate-400 font-medium">Garantie active : Oui</div>
                            </div>
                         </div>
                       ));
                    })}
                 </div>
              ) : (
                <div className="py-6 text-center text-slate-400 dark:text-slate-600 italic">
                   <p className="text-xs font-bold uppercase tracking-widest">Aucun produit sérialisé retourné</p>
                   <p className="text-[10px] mt-0.5">Ce retour ne contient pas d'équipements suivis individuellement par numéro de série.</p>
                </div>
              )}
            </div>

            {/* Container 4: Documents liés */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">4. Documents justificatifs liés</h3>
              </div>
              {supplierReturn.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supplierReturn.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-indigo-300 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                         <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center rounded-lg border border-rose-100/30">
                            <FileText className="w-4 h-4" />
                         </div>
                         <div className="truncate">
                            <span className="block text-xs font-bold text-slate-900 dark:text-white truncate" title={doc.name}>{doc.name}</span>
                            <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">{doc.type} {doc.size ? `• ${doc.size}` : ''}</span>
                         </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                         <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 dark:text-slate-600 italic">
                  <p className="text-xs font-bold uppercase tracking-widest">Aucun document joint pour le moment</p>
                  <p className="text-[10px] mt-0.5">Vous pouvez télécharger ou lier des accords RMA ou des photos de contrôle broyées.</p>
                </div>
              )}
            </div>

            {/* Container 5: Suivi fournisseur */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">5. Suivi fournisseur (RMA Pipeline)</h3>
              </div>
              <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
                {supplierReturn.tracking.map((track, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Indicator */}
                    <span className={cn(
                      "absolute -left-[30px] top-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[10px]",
                      track.completed 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-white dark:bg-slate-950 border-slate-300 text-slate-400"
                    )}>
                       {track.completed ? '✓' : idx + 1}
                    </span>
                    <div>
                      <h4 className={cn("text-xs font-bold uppercase tracking-wider", track.completed ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                        {track.name}
                      </h4>
                      {track.date && (
                        <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">{track.date}</p>
                      )}
                      {track.description && (
                        <p className="text-xs text-slate-500 mt-1">{track.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Container 6: Historique */}
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-1 h-4 bg-sky-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">6. Historique des événements</h3>
              </div>
              <div className="space-y-4">
                 {supplierReturn.history.map((hist, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-xs">
                       <span className="w-24 text-[10px] text-slate-400 font-bold shrink-0 font-mono text-left">{hist.date}</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 shrink-0" />
                       <div className="flex-1">
                          <p className="text-slate-800 dark:text-slate-200 font-medium">{hist.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Réalisé par: {hist.user}</p>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

          </div>

          {/* Sidebar on the right */}
          <div className="w-full lg:w-[320px] bg-white lg:bg-transparent dark:bg-slate-950 lg:dark:bg-transparent border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-6 md:p-8 shrink-0 space-y-6">
             {/* General identity card */}
             <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Synthèse rapide</h3>
                
                <div className="space-y-3.5">
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Réf. Retour</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{supplierReturn.reference}</span>
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Fournisseur</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{supplierReturn.supplierName}</span>
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Statut actuel</span>
                      <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest mt-1", getStatusBadgeColor(supplierReturn.status))}>
                        {supplierReturn.status}
                      </span>
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Responsable</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{supplierReturn.responsible}</span>
                   </div>
                   {supplierReturn.validationDate && (
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Date de validation</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{supplierReturn.validationDate}</span>
                     </div>
                   )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                   <div className="flex gap-2.5 items-start p-3 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/10 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                         <span className="font-bold uppercase tracking-wider block text-[9px] text-indigo-600 dark:text-indigo-400">Règle de stock</span>
                         <span className="opacity-90 leading-tight">Le matériel est bloqué du stock disponible dès sa validation physique pour expédition.</span>
                      </div>
                   </div>
                </div>

             </div>

             {/* Fast downloads wrapper */}
             <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Documents rapides</h3>
                <div className="space-y-2">
                   <button className="w-full flex items-center justify-between text-left p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 rounded-xl text-xs font-semibold group transition-colors">
                      <span className="truncate group-hover:text-indigo-600">Bon de retour.pdf</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                   </button>
                   <button className="w-full flex items-center justify-between text-left p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 rounded-xl text-xs font-semibold group transition-colors">
                      <span className="truncate group-hover:text-indigo-600">Certificat garantie.pdf</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                   </button>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Confirmation Modals (Portals / dialogs look like product and stock popup design with blur) */}
      <AnimatePresence>
         {showConfirmValider && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={() => setShowConfirmValider(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md z-10 space-y-4"
              >
                 <div className="flex items-center gap-3 text-amber-500">
                    <ShieldAlert className="w-7 h-7" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirmer la validation ?</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    En validant ce retour fournisseur, le stock disponible sera diminué des quantités sélectionnées et les numéros de série associés passeront au statut <b>"Retour fournisseur"</b> de manière permanente.
                 </p>
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowConfirmValider(false)} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={executeValider} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg"
                    >
                      Confirmer et bloquer le stock
                    </button>
                 </div>
              </motion.div>
           </div>
         )}

         {showConfirmAnnuler && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={() => setShowConfirmAnnuler(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md z-10 space-y-4"
              >
                 <div className="flex items-center gap-3 text-red-500">
                    <AlertTriangle className="w-7 h-7" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirmer l'annulation ?</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Cette action est irréversible. Le retour fournisseur sera marqué comme annulé et aucune transaction de stock ne sera impactée.
                 </p>
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowConfirmAnnuler(false)} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      Retour
                    </button>
                    <button 
                      onClick={executeAnnuler} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-lg"
                    >
                      Confirmer l'annulation
                    </button>
                 </div>
              </motion.div>
           </div>
         )}

         {showConfirmCloturer && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={() => setShowConfirmCloturer(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg z-10 space-y-4"
              >
                 <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 className="w-7 h-7" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Clôturer le retour fournisseur</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Sélectionnez la résolution finale apportée par le fournisseur afin de la consigner dans l'historique et de libérer ou acter la transaction financière.
                 </p>

                 <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Décision de clôture :</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setClotureChoice('Echange')}
                         className={cn("p-3 border rounded-xl text-left flex flex-col gap-1 transition-all", clotureChoice === 'Echange' ? "border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-850")}
                       >
                          <span className="text-xs font-bold text-slate-800 dark:text-white">Échange accepté</span>
                          <span className="text-[10px] text-slate-400">Nouveau produit renvoyé par le fournisseur</span>
                       </button>

                       <button 
                         onClick={() => setClotureChoice('Avoir')}
                         className={cn("p-3 border rounded-xl text-left flex flex-col gap-1 transition-all", clotureChoice === 'Avoir' ? "border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-850")}
                       >
                          <span className="text-xs font-bold text-slate-800 dark:text-white">Avoir reçu</span>
                          <span className="text-[10px] text-slate-400">Facture d'avoir enregistrée en comptabilité</span>
                       </button>

                       <button 
                         onClick={() => setClotureChoice('ReparationRefusee')}
                         className={cn("p-3 border rounded-xl text-left flex flex-col gap-1 transition-all", clotureChoice === 'ReparationRefusee' ? "border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-850")}
                       >
                          <span className="text-xs font-bold text-slate-800 dark:text-white">Réparation refusée</span>
                          <span className="text-[10px] text-slate-400">Le matériel n'a pas pu être pris sous garantie</span>
                       </button>

                       <button 
                         onClick={() => setClotureChoice('Remplacement')}
                         className={cn("p-3 border rounded-xl text-left flex flex-col gap-1 transition-all", clotureChoice === 'Remplacement' ? "border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-850")}
                       >
                          <span className="text-xs font-bold text-slate-800 dark:text-white">Remplacement standard</span>
                          <span className="text-[10px] text-slate-400">Matériel équivalant réexpédié</span>
                       </button>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button 
                      onClick={() => setShowConfirmCloturer(false)} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={executeCloturer} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg"
                    >
                      Confirmer et fermer le dossier
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
