import React, { useState, useRef, useEffect } from 'react';
import { SupplierReceipt, ReceiptStatus, ReceiptProduct } from './types';
import { 
  ArrowLeft, Settings, ChevronDown, Download, FileText, History, 
  Package, User, ShieldAlert, Barcode, Calendar, Box, 
  DollarSign, ExternalLink, Archive, Copy, AlertTriangle, 
  CheckCircle2, Clock, Building2, Truck, FileCheck, Tag, Info, ListFilter, AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { EntryVoucherPreview } from './EntryVoucherPreview';

interface ReceiptDetailsProps {
  receipt: SupplierReceipt;
  onBack: () => void;
  onEdit?: (receipt: SupplierReceipt) => void;
  onValidated?: () => void;
}

export function ReceiptDetails({ receipt, onBack, onEdit, onValidated }: ReceiptDetailsProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEntryVoucherOpen, setIsEntryVoucherOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);

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

  const getStatusBadgeColor = (status: ReceiptStatus) => {
    switch (status) {
      case 'Validée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Écart détecté': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Conforme': return 'text-emerald-600 dark:text-emerald-400';
      case 'Abîmé': return 'text-red-600 dark:text-red-400';
      case 'Manquant': return 'text-orange-600 dark:text-orange-400';
      case 'Partiel': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const serializedProducts = receipt.products.filter(p => p.isSerialized);
  const gapsCount = receipt.gaps?.length || 0;
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/supplier-receipts/${receipt.id}/validate`, { method: 'POST' });
      if (!response.ok) throw new Error('Validation impossible');
      onValidated?.();
    } finally {
      setIsValidating(false);
    }
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
          <span className="hidden sm:inline">Retour à la liste</span>
          <span className="sm:hidden">Retour</span>
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
                <div className="font-bold text-slate-900 dark:text-white truncate">Réception {receipt.reference}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border truncate", getStatusBadgeColor(receipt.status))}>
                    {receipt.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {receipt.status === 'Brouillon' && (
            <>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-60 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isValidating ? 'Validation...' : 'Valider la réception'}
              </button>
              <button 
                onClick={() => onEdit?.(receipt)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 transition-colors"
              >
                Modifier
              </button>
            </>
          )}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
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
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setIsEntryVoucherOpen(true);
                      }}
                      disabled={!receipt.entryVoucher}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Consulter bon d'entrée
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                      <Download className="w-4 h-4 text-indigo-500 shrink-0" /> Exporter réception
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                      <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> Historique des changements
                    </button>
                    {receipt.status === 'Brouillon' && (
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Annuler réception
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <h1 className="text-3xl font-bold tracking-tight">Réception {receipt.reference}</h1>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusBadgeColor(receipt.status))}>
                  {receipt.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Fournisseur</span>
                  <span className="font-medium text-slate-900 dark:text-white">{receipt.supplierName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date réception</span>
                  <span className="font-medium text-slate-900 dark:text-white">{receipt.date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Dépôt</span>
                  <span className="font-medium text-slate-900 dark:text-white">{receipt.warehouseName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Responsable</span>
                  <span className="font-medium text-slate-900 dark:text-white">{receipt.responsible}</span>
                </div>
              </div>

              {/* Quick Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Quantité reçue
                  </div>
                  <div className="text-2xl font-bold tracking-tight flex items-baseline gap-1.5">
                    {receipt.totalQty || 0}
                    <span className="text-xs font-medium text-slate-400 uppercase">Unités</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Valeur HT
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {(receipt.totalValue || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400 uppercase">DA</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 shrink-0" /> Produits
                  </div>
                  <div className="text-2xl font-bold tracking-tight truncate">
                    {receipt.products.length} <span className="text-xs font-medium text-slate-400 uppercase">Réf.</span>
                  </div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border transition-colors",
                  gapsCount > 0 ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}>
                  <div className={cn(
                    "text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2",
                    gapsCount > 0 ? "text-orange-800 dark:text-orange-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <AlertTriangle className="w-4 h-4 shrink-0" /> Écarts détecter
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                    <div className={cn(
                      "text-2xl font-bold leading-none",
                      gapsCount > 0 ? "text-orange-600 dark:text-orange-500" : "text-slate-300 dark:text-slate-700"
                    )}>{gapsCount}</div>
                    {gapsCount > 0 && (
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Attention
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8">
              
              {/* Informations Générales */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Informations générales de réception
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Référence réception</span>
                    <p className="text-sm font-medium font-mono">{receipt.reference}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Fournisseur</span>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{receipt.supplierName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Réf. BL Fournisseur</span>
                    <p className="text-sm font-medium font-mono">{receipt.deliveryNoteRef}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Réf. Commande</span>
                    <p className="text-sm font-medium font-mono text-indigo-600">{receipt.purchaseOrderRef}</p>
                  </div>
                </div>
              </div>

              {/* Liste des produits */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <Package className="w-4 h-4 text-slate-400" />
                   <h3 className="text-sm font-semibold uppercase tracking-wider">Produits réceptionnés</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Réf. Frs</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté Cmd</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté Reçue</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix Unit. HT</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emplacement</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">État</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {receipt.products.map((p, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{p.name}</span>
                              <span className="text-[10px] font-mono text-indigo-500 font-medium tracking-tight uppercase">{p.reference}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-500">RF-{p.reference?.split('-')[1] || '00'}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-400 text-right">{p.qtyOrdered}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex flex-col items-end">
                                <span className={cn("text-sm font-medium", p.qtyOrdered !== p.qtyReceived && "text-orange-500 font-bold")}>{p.qtyReceived}</span>
                                {p.qtyOrdered !== p.qtyReceived && <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider leading-none">Écart</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right">{(p.purchasePrice || 0).toLocaleString()} DA</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{p.locationName || '-'}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                <span className={cn("text-xs font-medium uppercase tracking-wider", getConditionColor(p.condition))}>{p.condition}</span>
                                {p.hasGap && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Numéros de série */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-slate-400" /> Numéros de série saisis
                  </h3>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{serializedProducts.length} produit(s) avec S/N</span>
                </div>
                
                {serializedProducts.length > 0 ? (
                  <div className="space-y-6">
                    {serializedProducts.map((p, idx) => (
                      <div key={idx} className="space-y-3">
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">({p.serialNumbers?.length || 0} S/N)</span>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {p.serialNumbers?.map((sn, snIdx) => (
                              <div key={snIdx} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between group">
                                 {sn}
                                 <Copy className="w-3 h-3 text-slate-300 cursor-pointer hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 dark:border-slate-900 rounded-xl">
                    <Barcode className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-3" />
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest italic">Aucun numéro de série sur cette réception</p>
                  </div>
                )}
              </div>

              {/* Écarts */}
              {gapsCount > 0 && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" /> Détails des écarts et anomalies
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {receipt.gaps?.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-xl group hover:border-orange-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-orange-200 flex items-center justify-center shrink-0">
                           <AlertCircle className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-widest leading-none">{gap.type}</span>
                             {gap.productName && <span className="text-xs text-slate-500 font-medium">— {gap.productName}</span>}
                           </div>
                           <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{gap.comment}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historique */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" /> Audit & Historique
                </h3>
                <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
                  {receipt.history.map((h, i) => (
                     <div key={i} className="relative pl-10 flex items-start group">
                        <div className={cn(
                          "absolute left-0 w-6 h-6 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center z-10",
                          i === receipt.history.length - 1 ? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/10" : "border-slate-200"
                        )}>
                           {i === receipt.history.length - 1 ? <CheckCircle2 className="w-3 h-3 text-indigo-500" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-sm font-bold uppercase tracking-tight">{h.action}</h4>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{h.date}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                 {h.user.charAt(0)}
                              </div>
                              <p className="text-xs text-slate-500">Opéré par <span className="text-slate-900 dark:text-white font-medium">{h.user}</span></p>
                           </div>
                        </div>
                     </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[320px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto hidden xl:block z-0">
            <div className="p-8 space-y-8">
               <div className="space-y-4">
                  <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Mouvements de stock</label>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                     <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                       {receipt.status === 'Validée' 
                        ? "Cette réception a automatiquement généré des entrées en stock pour l'ensemble des produits listés."
                        : "Le stock ne sera mouvementé qu'après validation de cette réception."}
                     </p>
                     <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-400 uppercase">Impact</span>
                        <span className="text-xs font-bold text-indigo-600">+{(receipt.totalQty || 0)} unités</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-5">
                  <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block pb-2 border-b border-slate-100 dark:border-slate-800">Liens rapides</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEntryVoucherOpen(true)}
                      disabled={!receipt.entryVoucher}
                      className="w-full flex items-center gap-3 p-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                         <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      Bon d'entrée (PDF)
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                      <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                         <Truck className="w-4 h-4 text-emerald-600" />
                      </div>
                      Fiche Fournisseur
                    </button>
                    {receipt.purchaseOrderRef && (
                      <button className="w-full flex items-center gap-3 p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                           <ExternalLink className="w-4 h-4 text-amber-600" />
                        </div>
                        Commande Source
                      </button>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <EntryVoucherPreview isOpen={isEntryVoucherOpen} onClose={() => setIsEntryVoucherOpen(false)} receipt={receipt} />
    </div>
  );
}
